-- Idempotent repair for missing onboarding/preferences schema

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Music"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  CREATE TYPE "PreferenceStatus" AS ENUM ('LIKE', 'DISLIKE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "PreferenceSource" AS ENUM ('ONBOARDING', 'HOME', 'SEARCH');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "UserMusicPreference" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "deezerId" TEXT,
  "title" TEXT NOT NULL,
  "artist" TEXT NOT NULL,
  "artistId" TEXT,
  "audioUrl" TEXT,
  "imageUrl" TEXT,
  "status" "PreferenceStatus" NOT NULL,
  "source" "PreferenceSource" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UserMusicPreference'
      AND column_name = 'jamendoId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UserMusicPreference'
      AND column_name = 'deezerId'
  ) THEN
    EXECUTE 'ALTER TABLE "UserMusicPreference" RENAME COLUMN "jamendoId" TO "deezerId"';
  END IF;
END $$;

ALTER TABLE "UserMusicPreference"
  ADD COLUMN IF NOT EXISTS "deezerId" TEXT;

ALTER TABLE "UserMusicPreference"
  ADD COLUMN IF NOT EXISTS "artistId" TEXT;

ALTER TABLE "UserMusicPreference"
  ADD COLUMN IF NOT EXISTS "audioUrl" TEXT;

ALTER TABLE "UserMusicPreference"
  ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

UPDATE "UserMusicPreference"
SET "updatedAt" = COALESCE("updatedAt", NOW())
WHERE "updatedAt" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UserMusicPreference'
      AND column_name = 'jamendoId'
  ) THEN
    EXECUTE 'UPDATE "UserMusicPreference" SET "deezerId" = "jamendoId" WHERE "deezerId" IS NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "UserMusicPreference"
    WHERE "deezerId" IS NULL
  ) THEN
    EXECUTE 'ALTER TABLE "UserMusicPreference" ALTER COLUMN "deezerId" SET NOT NULL';
  END IF;
END $$;

DROP INDEX IF EXISTS "UserMusicPreference_userId_jamendoId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "UserMusicPreference_userId_deezerId_key"
  ON "UserMusicPreference" ("userId", "deezerId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'UserMusicPreference_userId_fkey'
  ) THEN
    ALTER TABLE "UserMusicPreference"
      ADD CONSTRAINT "UserMusicPreference_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
