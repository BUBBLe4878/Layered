import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { type Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
    // AUTO‑LOGIN FULL FAKE USER
    event.locals.user = {
        id: 1,
        slackId: "DEV123",
        name: "StephenFromColorado",
        profilePicture: "https://avatars.slack-edge.com/2026-04-08/10856884814167_957435e356f29a931a8a_1024.png",
        clay: 0,
        brick: 55,
        shopScore: 1831.6599,
        isPrinter: true,
        hasT1Review: true,
        hasT2Review: true,
        hasAdmin: true,
        hasBasePrinter: true,
        printer: { path: [0] },
        printerFulfilment: "queued"
    };

    event.locals.session = {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    };

    return resolve(event);
};

export const handle: Handle = sequence(Sentry.sentryHandle(), handleAuth);

function routeRequiresAuth(route: string) {
    return false;
}

export const handleError = Sentry.handleErrorWithSentry();
