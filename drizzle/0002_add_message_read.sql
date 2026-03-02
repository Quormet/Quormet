-- Add is_read column to messages for tracking unread status
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "is_read" boolean DEFAULT false NOT NULL;
