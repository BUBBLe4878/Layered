ALTER TABLE "user"
ADD COLUMN "journalStreak" integer NOT NULL DEFAULT 0,
ADD COLUMN "journalStreakLastJournalAt" timestamp;
