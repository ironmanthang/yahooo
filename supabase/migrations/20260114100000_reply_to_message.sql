-- Add reply-to functionality for messages
-- Allows users to quote-reply to specific messages

-- Add reply reference column
ALTER TABLE messages 
ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Index for faster lookups when fetching replied messages
CREATE INDEX idx_messages_reply_to ON messages(reply_to_id);

-- Comment for documentation
COMMENT ON COLUMN messages.reply_to_id IS 'References the message being replied to, if this is a reply';
