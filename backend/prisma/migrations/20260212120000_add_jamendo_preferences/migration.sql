-- CreateEnum
CREATE TYPE "PreferenceStatus" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "PreferenceSource" AS ENUM ('ONBOARDING', 'HOME', 'SEARCH');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserMusicPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jamendoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "status" "PreferenceStatus" NOT NULL,
    "source" "PreferenceSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMusicPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMusicPreference_userId_jamendoId_key" ON "UserMusicPreference"("userId", "jamendoId");

-- AddForeignKey
ALTER TABLE "UserMusicPreference" ADD CONSTRAINT "UserMusicPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
