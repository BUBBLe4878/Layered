import { db } from '$lib/server/db/index.js';
import { devlog, project, clubMembership, club } from '$lib/server/db/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and, or, sql } from 'drizzle-orm';
import type { Actions } from './$types';
import { sendSlackDM } from '$lib/server/slack.js';
import { isValidUrl } from '$lib/utils';
import { MAX_UPLOAD_SIZE } from '../config';
import { extname } from 'path';
import { env } from '$env/dynamic/private';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '$lib/server/s3';
import { ship } from '$lib/server/db/schema.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { put } from '@vercel/blob';

// ── Logging utility ──────────────────────────────────────────────
function log(stage: string, message: string, data?: any) {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] [SHIP_${stage}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

function parseProjectId(rawId: string): number {
	const id = Number.parseInt(rawId, 10);

	if (!Number.isInteger(id) || id <= 0) {
		throw error(404, { message: 'project not found' });
	}

	return id;
}

export async function load({ params, locals }) {
	log('LOAD_START', 'Loading ship page');
	const id = parseProjectId(params.id);

	if (!locals.user) {
		log('LOAD_AUTH_FAIL', 'User not authenticated');
		throw error(500);
	}
	log('LOAD_AUTH_OK', 'User authenticated', { userId: locals.user.id });

	try {
		const [queriedProject] = await db
			.select({
				id: project.id,
				name: project.name,
				description: project.description,

				url: project.url,
				editorFileType: project.editorFileType,
				editorUrl: project.editorUrl,
				uploadedFileUrl: project.uploadedFileUrl,
				modelFile: project.modelFile,

				createdAt: project.createdAt,
				status: project.status,
				timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
				devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(project)
			.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
			.where(
				and(
					eq(project.id, id),
					eq(project.userId, locals.user.id),
					eq(project.deleted, false),
					or(eq(project.status, 'building'), eq(project.status, 'rejected'))
				)
			)
			.groupBy(
				project.id,
				project.name,
				project.description,
				project.url,
				project.editorFileType,
				project.editorUrl,
				project.uploadedFileUrl,
				project.modelFile,
				project.createdAt,
				project.status
			)
			.limit(1);

		if (!queriedProject) {
			log('LOAD_PROJECT_NOT_FOUND', 'Project not found or not eligible for shipping', { projectId: id });
			throw error(404);
		}

		log('LOAD_PROJECT_OK', 'Project loaded', {
			projectId: queriedProject.id,
			name: queriedProject.name,
			status: queriedProject.status,
			timeSpent: queriedProject.timeSpent,
			devlogCount: queriedProject.devlogCount
		});

		// Check if user has a club membership
		const membership = await db
			.select({
				clubId: clubMembership.clubId,
				clubName: club.name
			})
			.from(clubMembership)
			.innerJoin(club, eq(clubMembership.clubId, club.id))
			.where(eq(clubMembership.userId, locals.user.id))
			.limit(1);

		log('LOAD_CLUB_CHECK', 'Club membership check', {
			hasMembership: membership.length > 0,
			clubName: membership[0]?.clubName
		});

		return {
			project: queriedProject,
			clubMembership: membership.length > 0 ? membership[0] : null
		};
	} catch (err) {
		log('LOAD_ERROR', 'Error during load', {
			error: err instanceof Error ? err.message : String(err),
			stack: err instanceof Error ? err.stack : undefined
		});
		throw err;
	}
}

export const actions = {
	default: async ({ locals, params, request }) => {
		const shipStart = Date.now();
		log('ACTION_START', 'Ship action initiated');

		// ── Auth check ──────────────────────────────────────────────
		if (!locals.user) {
			log('ACTION_AUTH_FAIL', 'User not authenticated');
			throw error(500);
		}
		log('ACTION_AUTH_OK', 'User authenticated', { userId: locals.user.id });

		const id = parseProjectId(params.id);

		try {
			// ── Parse form data ──────────────────────────────────────
			log('ACTION_PARSE_FORM', 'Parsing form data');
			const data = await request.formData();
			const printablesUrl = data.get('printables_url');
			const editorUrl = data.get('editor_url');
			const editorFile = data.get('editor_file') as File;
			const modelFile = data.get('model_file') as File;
			const previewImage = data.get('preview_image') as File;
			const submitAsClub = data.get('submit_as_club') === 'true';

			log('ACTION_FORM_DATA', 'Form data extracted', {
				hasPrintablesUrl: Boolean(printablesUrl),
				hasEditorUrl: Boolean(editorUrl),
				editorFileSize: editorFile?.size ?? 0,
				modelFileSize: modelFile?.size ?? 0,
				previewImageSize: previewImage?.size ?? 0,
				submitAsClub
			});

			// ── Validate Printables URL ──────────────────────────────
			log('ACTION_VALIDATE_PRINTABLES', 'Validating Printables URL');
			const printablesUrlString =
				printablesUrl && printablesUrl.toString() ? sanitizeUrl(printablesUrl.toString()) : null;

			const printablesUrlValid =
				printablesUrlString &&
				printablesUrlString.trim().length < 8000 &&
				isValidUrl(printablesUrlString.trim()) &&
				printablesUrlString !== 'about:blank';

			if (!printablesUrlValid) {
				log('ACTION_PRINTABLES_INVALID', 'Invalid Printables URL');
				return fail(400, {
					invalid_printables_url: true
				});
			}
			log('ACTION_PRINTABLES_OK', 'Printables URL valid');

			// ── Extract model ID and validate with Printables API ────
			log('ACTION_PRINTABLES_API', 'Extracting model ID and validating license');
			const printablesUrlObj = new URL(printablesUrlString.trim());
			const pathMatch = printablesUrlObj.pathname.match(/\/model\/(\d+)/);
			const modelId = pathMatch ? pathMatch[1] : '';

			log('ACTION_MODEL_ID', 'Model ID extracted', { modelId });

			const allowedLicenseIds = (env.PRINTABLES_ALLOWED_LICENSES_ID ?? '7,1,2,9,12,10,11')
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			if (allowedLicenseIds.length === 0) {
				log('ACTION_LICENSE_CONFIG_ERROR', 'License validation not configured');
				throw error(500, { message: 'license validation not configured' });
			}

			let timeoutId: ReturnType<typeof setTimeout> | null = null;
			try {
				const controller = new AbortController();
				timeoutId = setTimeout(() => controller.abort(), 10_000);

				log('ACTION_PRINTABLES_GRAPHQL', 'Querying Printables GraphQL API');
				const graphqlResponse = await fetch('https://api.printables.com/graphql/', {
					method: 'POST',
					headers: {
						'content-type': 'application/json'
					},
					signal: controller.signal,
					body: JSON.stringify({
						operationName: 'PrintDetail',
						query: `query PrintDetail($id: ID!) {
							print(id: $id) {
								id
								name
								license {
									id
									name
								}
							}
						}`,
						variables: { id: modelId }
					})
				});

				if (!graphqlResponse.ok) {
					log('ACTION_PRINTABLES_API_ERROR', 'Printables API returned non-200 status', {
						status: graphqlResponse.status
					});
					return fail(400, {
						invalid_printables_url: true
					});
				}
				const graphqlData = await graphqlResponse.json();
				const license = graphqlData?.data?.print?.license;

				log('ACTION_PRINTABLES_API_RESPONSE', 'Printables API response', {
					hasLicense: Boolean(license),
					licenseId: license?.id,
					licenseName: license?.name
				});

				if (!license || !license.id) {
					log('ACTION_LICENSE_NOT_FOUND', 'License not found in response');
					return fail(400, {
						invalid_printables_url: true
					});
				}

				const licenseMatch = allowedLicenseIds.some((allowed) => allowed === license.id.toString());

				if (!licenseMatch) {
					log('ACTION_LICENSE_NOT_ALLOWED', 'License not in allowed list', {
						licenseId: license.id,
						allowedLicenses: allowedLicenseIds
					});
					return fail(400, {
						invalid_license: true
					});
				}
				log('ACTION_LICENSE_OK', 'License validation passed');
			} catch (err) {
				log('ACTION_PRINTABLES_ERROR', 'Error validating Printables URL', {
					error: err instanceof Error ? err.message : String(err)
				});
				return fail(400, {
					invalid_printables_url: true
				});
			} finally {
				if (timeoutId) clearTimeout(timeoutId);
			}

			// ── Validate Editor URL ──────────────────────────────────
			log('ACTION_VALIDATE_EDITOR', 'Validating editor input');
			const editorUrlExists = editorUrl && editorUrl.toString();
			const editorUrlString = editorUrlExists ? sanitizeUrl(editorUrl.toString()) : null;
			const editorUrlValid =
				editorUrlString && editorUrlString.trim().length < 8000 && isValidUrl(editorUrlString.trim());

			if (editorUrlExists && (!editorUrlValid || editorUrlString === 'about:blank')) {
				log('ACTION_EDITOR_URL_INVALID', 'Invalid editor URL');
				return fail(400, {
					invalid_editor_url: true
				});
			}

			// ── Validate Editor File ─────────────────────────────────
			const editorFileExists = editorFile instanceof File && editorFile.size > 0;
			const editorFileValid = editorFileExists && editorFile.size <= MAX_UPLOAD_SIZE;

			if (!editorUrlExists && !editorFileExists) {
				log('ACTION_EDITOR_MISSING', 'Neither editor URL nor file provided');
				throw error(400, { message: "editor file or url doesn't exist" });
			}

			if (editorUrlExists && editorFileExists) {
				log('ACTION_EDITOR_BOTH', 'Both editor URL and file provided (invalid)');
				throw error(400, { message: 'editor file or url both exist' });
			}

			if (editorFileExists && !editorFileValid) {
				log('ACTION_EDITOR_FILE_INVALID', 'Editor file invalid (too large or wrong type)', {
					fileSize: editorFile.size,
					maxSize: MAX_UPLOAD_SIZE
				});
				return fail(400, {
					invalid_editor_file: true
				});
			}
			log('ACTION_EDITOR_OK', 'Editor input valid', {
				type: editorUrlExists ? 'url' : 'file',
				fileSize: editorFileExists ? editorFile.size : undefined
			});

			// ── Validate Model File ──────────────────────────────────
			log('ACTION_VALIDATE_MODEL', 'Validating 3D model file');
			const modelFileValid =
				modelFile instanceof File &&
				modelFile.size > 0 &&
				modelFile.size <= MAX_UPLOAD_SIZE &&
				extname(modelFile.name).toLowerCase() == '.3mf' &&
				[
					'model/3mf',
					'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
					'application/vnd.ms-3mfdocument',
					'application/octet-stream',
					'text/plain'
				].includes(modelFile.type);

			if (!modelFileValid) {
				log('ACTION_MODEL_FILE_INVALID', 'Model file validation failed', {
					fileSize: modelFile?.size ?? 0,
					maxSize: MAX_UPLOAD_SIZE,
					fileName: modelFile?.name,
					mimeType: modelFile?.type,
					extension: modelFile ? extname(modelFile.name).toLowerCase() : undefined
				});
				return fail(400, {
					invalid_model_file: true
				});
			}
			log('ACTION_MODEL_OK', 'Model file valid', { fileSize: modelFile.size });

			// ── Validate Preview Image ───────────────────────────────
			log('ACTION_VALIDATE_PREVIEW', 'Validating preview image');
			const previewImageExists = previewImage instanceof File && previewImage.size > 0;
			const previewImageValid =
				previewImageExists &&
				previewImage.size <= MAX_UPLOAD_SIZE &&
				['image/jpeg', 'image/png', 'image/webp'].includes(previewImage.type);

			if (previewImageExists && !previewImageValid) {
				log('ACTION_PREVIEW_IMAGE_INVALID', 'Preview image validation failed', {
					fileSize: previewImage?.size ?? 0,
					maxSize: MAX_UPLOAD_SIZE,
					mimeType: previewImage?.type
				});
				return fail(400, {
					invalid_preview_image: true
				});
			}
			log('ACTION_PREVIEW_OK', 'Preview image valid', { fileSize: previewImageExists ? previewImage.size : 0 });

			// ── Query and validate project ───────────────────────────
			log('ACTION_QUERY_PROJECT', 'Querying project for validation');
			const [queriedProject] = await db
				.select({
					id: project.id,
					name: project.name,
					description: project.description,
					url: project.url,
					timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
					devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
				})
				.from(project)
				.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
				.where(
					and(
						eq(project.id, id),
						eq(project.userId, locals.user.id),
						eq(project.deleted, false),
						or(eq(project.status, 'building'), eq(project.status, 'rejected'))
					)
				)
				.groupBy(project.id, project.name, project.description, project.url)
				.limit(1);

			if (!queriedProject) {
				log('ACTION_PROJECT_NOT_FOUND', 'Project not found or not eligible for shipping', {
					projectId: id
				});
				throw error(404, { message: 'project not found' });
			}

			log('ACTION_PROJECT_FOUND', 'Project found', {
				projectId: queriedProject.id,
				name: queriedProject.name,
				timeSpent: queriedProject.timeSpent,
				devlogCount: queriedProject.devlogCount
			});

			// ── Validate requirements ────────────────────────────────
			log('ACTION_VALIDATE_REQUIREMENTS', 'Validating project requirements');

			if (queriedProject.timeSpent < 60) {
				log('ACTION_TIME_INSUFFICIENT', 'Insufficient time spent', {
					timeSpent: queriedProject.timeSpent,
					required: 60
				});
				throw error(400, { message: 'minimum 1h needed to ship' });
			}

			if (queriedProject.devlogCount < 2) {
				log('ACTION_DEVLOG_INSUFFICIENT', 'Insufficient devlogs', {
					devlogCount: queriedProject.devlogCount,
					required: 2
				});
				throw error(400, { message: 'minimum 2 journal logs required to ship' });
			}

			if (queriedProject.description == '') {
				log('ACTION_DESCRIPTION_MISSING', 'Project description missing');
				throw error(400, { message: 'project must have a description' });
			}

			log('ACTION_REQUIREMENTS_OK', 'All requirements met');

			// ── Upload files ─────────────────────────────────────────
			log('ACTION_UPLOAD_START', 'Starting file uploads');
			const useR2 = Boolean(
				env.S3_BUCKET_NAME && env.S3_API_URL && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
			);
			log('ACTION_STORAGE_CONFIG', 'Storage configuration', { useR2 });

			let editorFileUrl: string | null = null;
			let modelFileUrl: string | null = null;
			let previewImageUrl: string | null = null;

			try {
				if (editorFileExists) {
					log('ACTION_UPLOAD_EDITOR', 'Uploading editor file');
					if (useR2) {
						const editorFilePath = `ships/editor-files/${crypto.randomUUID()}${extname(editorFile.name)}`;
						const editorFileCommand = new PutObjectCommand({
							Bucket: env.S3_BUCKET_NAME!,
							Key: editorFilePath,
							Body: Buffer.from(await editorFile.arrayBuffer())
						});
						await S3.send(editorFileCommand);
						editorFileUrl = editorFilePath;
						log('ACTION_UPLOAD_EDITOR_R2', 'Editor file uploaded to R2', { path: editorFilePath });
					} else {
						const editorBlob = await put(
							`ships/editor-files/${crypto.randomUUID()}${extname(editorFile.name)}`,
							editorFile,
							{ access: 'public' }
						);
						editorFileUrl = editorBlob.url;
						log('ACTION_UPLOAD_EDITOR_VERCEL', 'Editor file uploaded to Vercel Blob', {
							url: editorFileUrl
						});
					}
				}

				log('ACTION_UPLOAD_MODEL', 'Uploading model file');
				if (useR2) {
					const modelPath = `ships/models/${crypto.randomUUID()}${extname(modelFile.name).toLowerCase()}`;
					const modelCommand = new PutObjectCommand({
						Bucket: env.S3_BUCKET_NAME!,
						Key: modelPath,
						Body: Buffer.from(await modelFile.arrayBuffer())
					});
					await S3.send(modelCommand);
					modelFileUrl = modelPath;
					log('ACTION_UPLOAD_MODEL_R2', 'Model file uploaded to R2', { path: modelPath });
				} else {
					const modelBlob = await put(
						`ships/models/${crypto.randomUUID()}${extname(modelFile.name).toLowerCase()}`,
						modelFile,
						{ access: 'public' }
					);
					modelFileUrl = modelBlob.url;
					log('ACTION_UPLOAD_MODEL_VERCEL', 'Model file uploaded to Vercel Blob', { url: modelFileUrl });
				}

				if (previewImageExists) {
					log('ACTION_UPLOAD_PREVIEW', 'Uploading preview image');
					if (useR2) {
						const previewPath = `ships/previews/${crypto.randomUUID()}${extname(previewImage.name)}`;
						const previewCommand = new PutObjectCommand({
							Bucket: env.S3_BUCKET_NAME!,
							Key: previewPath,
							Body: Buffer.from(await previewImage.arrayBuffer())
						});
						await S3.send(previewCommand);
						previewImageUrl = previewPath;
						log('ACTION_UPLOAD_PREVIEW_R2', 'Preview image uploaded to R2', { path: previewPath });
					} else {
						const previewBlob = await put(
							`ships/previews/${crypto.randomUUID()}${extname(previewImage.name)}`,
							previewImage,
							{ access: 'public' }
						);
						previewImageUrl = previewBlob.url;
						log('ACTION_UPLOAD_PREVIEW_VERCEL', 'Preview image uploaded to Vercel Blob', {
							url: previewImageUrl
						});
					}
				}

				log('ACTION_UPLOAD_SUCCESS', 'All files uploaded successfully');
			} catch (err) {
				log('ACTION_UPLOAD_ERROR', 'File upload failed', {
					error: err instanceof Error ? err.message : String(err),
					stack: err instanceof Error ? err.stack : undefined
				});
				return fail(500, {
					ship_submit_error: true,
					ship_error_message: 'Failed to upload ship assets. Please retry in a moment.'
				});
			}

			// ── Verify uploaded URLs ─────────────────────────────────
			log('ACTION_VERIFY_URLS', 'Verifying uploaded file URLs');
			if (!modelFileUrl || (editorFileExists && !editorFileUrl)) {
				log('ACTION_URL_MISSING', 'Missing required uploaded file URLs', {
					editorFileExists,
					hasEditorFileUrl: Boolean(editorFileUrl),
					hasModelFileUrl: Boolean(modelFileUrl)
				});
				return fail(500, {
					ship_submit_error: true,
					ship_error_message: 'Failed to prepare uploaded file URLs. Please retry.'
				});
			}
			log('ACTION_URLS_OK', 'All URLs present and valid');

			// ── Update project status ────────────────────────────────
			log('ACTION_UPDATE_PROJECT', 'Updating project status to submitted');
			try {
				await db
					.update(project)
					.set({
						status: 'submitted',
						url: printablesUrlString,
						editorFileType: editorUrlExists ? 'url' : 'upload',
						editorUrl: editorUrlExists ? editorUrlString : undefined,
						uploadedFileUrl: editorFileExists ? editorFileUrl : undefined,
						modelFile: modelFileUrl,
						previewImage: previewImageUrl
					})
					.where(
						and(
							eq(project.id, queriedProject.id),
							eq(project.userId, locals.user.id),
							eq(project.deleted, false)
						)
					);
				log('ACTION_UPDATE_PROJECT_OK', 'Project status updated successfully');
			} catch (err) {
				log('ACTION_UPDATE_PROJECT_ERROR', 'Project update failed', {
					error: err instanceof Error ? err.message : String(err),
					stack: err instanceof Error ? err.stack : undefined
				});
				return fail(500, {
					ship_submit_error: true,
					ship_error_message: 'Failed to save project ship state. Please retry.'
				});
			}

			// ── Get club ID if submitting as club ────────────────────
			log('ACTION_CLUB_CHECK', 'Checking club submission');
			let clubIdForShip: number | null = null;
			if (submitAsClub) {
				const [membership] = await db
					.select({ clubId: clubMembership.clubId })
					.from(clubMembership)
					.where(eq(clubMembership.userId, locals.user.id))
					.limit(1);
				if (membership) {
					clubIdForShip = membership.clubId;
					log('ACTION_CLUB_FOUND', 'Club membership found for submission', { clubId: clubIdForShip });
				} else {
					log('ACTION_CLUB_NOT_FOUND', 'No club membership found despite submitAsClub=true');
				}
			} else {
				log('ACTION_CLUB_INDIVIDUAL', 'Individual submission (no club)');
			}

			// ── Insert ship record ───────────────────────────────────
			log('ACTION_INSERT_SHIP', 'Creating ship record in database');
			try {
				await db.insert(ship).values({
					userId: locals.user.id,
					projectId: queriedProject.id,
					url: printablesUrlString,

					editorFileType: editorUrlExists ? 'url' : 'upload',
					editorUrl: editorUrlExists ? editorUrlString : undefined,
					uploadedFileUrl: editorFileExists ? editorFileUrl : undefined,

					modelFile: modelFileUrl,
					previewImage: previewImageUrl,
					clubId: clubIdForShip
				});
				log('ACTION_INSERT_SHIP_OK', 'Ship record created successfully');
			} catch (err) {
				log('ACTION_INSERT_SHIP_ERROR', 'Ship record creation failed', {
					error: err instanceof Error ? err.message : String(err),
					stack: err instanceof Error ? err.stack : undefined
				});
				return fail(500, {
					ship_submit_error: true,
					ship_error_message: 'Failed to create ship record in database. Please retry.'
				});
			}

			// ── Send Slack notification ──────────────────────────────
			log('ACTION_SLACK_NOTIFICATION', 'Sending Slack notification');
			try {
				void sendSlackDM(
					locals.user.slackId,
					`Hii :hyper-dino-wave:\n Your project <https://layered.hackclub.com/dashboard/projects/${queriedProject.id}|${queriedProject.name}> has been shipped and is now under review, we'll take a look and get back to you soon! :woooo:`
				);
				log('ACTION_SLACK_OK', 'Slack notification sent');
			} catch (err) {
				log('ACTION_SLACK_ERROR', 'Slack notification failed (non-blocking)', {
					error: err instanceof Error ? err.message : String(err)
				});
				// Don't fail the entire action if Slack fails
			}

			// ── Success redirect ─────────────────────────────────────
			const totalTime = Date.now() - shipStart;
			log('ACTION_SUCCESS', 'Ship action completed successfully', {
				duration_ms: totalTime,
				projectId: queriedProject.id,
				projectName: queriedProject.name
			});

			return redirect(303, '/dashboard/projects');
		} catch (err) {
			const totalTime = Date.now() - shipStart;
			log('ACTION_FATAL_ERROR', 'Unhandled error in ship action', {
				duration_ms: totalTime,
				error: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined
			});
			throw err;
		}
	}
} satisfies Actions;
