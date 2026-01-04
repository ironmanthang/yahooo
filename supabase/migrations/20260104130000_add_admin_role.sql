-- ============================================
-- Admin Role Feature Migration
-- Adds role column to conversation_participants
-- ============================================

-- Add role column to conversation_participants
ALTER TABLE public.conversation_participants 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'));
