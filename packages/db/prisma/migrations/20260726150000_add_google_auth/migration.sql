-- Google Sign-In support: accounts created via Google have no password, and we
-- store the Google subject id to recognise returning users.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
