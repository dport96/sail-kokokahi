-- Add optional notes for event signups
ALTER TABLE "UserEvent"
ADD COLUMN "notes" TEXT;
