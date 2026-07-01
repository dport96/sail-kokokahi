-- Repair migration for production schema drift.
-- Ensures Event.pin exists even if prior migration history is inconsistent.
ALTER TABLE "Event"
ADD COLUMN IF NOT EXISTS "pin" TEXT;
