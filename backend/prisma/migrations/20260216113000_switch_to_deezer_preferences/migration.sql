ALTER TABLE "UserMusicPreference" RENAME COLUMN "jamendoId" TO "deezerId";

DROP INDEX "UserMusicPreference_userId_jamendoId_key";

CREATE UNIQUE INDEX "UserMusicPreference_userId_deezerId_key" ON "UserMusicPreference"("userId", "deezerId");

ALTER TABLE "UserMusicPreference" ADD COLUMN "artistId" TEXT;
