-- AlterTable
ALTER TABLE "User" ADD COLUMN     "billingNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT;
