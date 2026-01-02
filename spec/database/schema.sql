-- ============================================
-- Real-time DM Chat - Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================
-- TABLES
-- ============================================

-- 1. Profiles (auto-created on signup)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversations (chat threads)
CREATE TABLE public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Participants (who is in which conversation)
CREATE TABLE public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- 4. Messages
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username TEXT;
    base_username TEXT;
    counter INT := 0;
BEGIN
    -- Get username from metadata or email
    base_username := COALESCE(
        NEW.raw_user_meta_data->>'username', 
        split_part(NEW.email, '@', 1)
    );
    new_username := base_username;
    
    -- If username exists, append random suffix
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
        counter := counter + 1;
        new_username := base_username || '_' || floor(random() * 1000)::text;
        IF counter > 10 THEN
            -- Fallback to UUID suffix if too many conflicts
            new_username := base_username || '_' || substr(NEW.id::text, 1, 8);
            EXIT;
        END IF;
    END LOOP;
    
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        new_username,
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- RATE LIMITING FUNCTION
-- Max 5 messages per 10 seconds per user
-- ============================================

CREATE OR REPLACE FUNCTION public.check_message_rate_limit()
RETURNS BOOLEAN AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM public.messages
    WHERE sender_id = auth.uid()
    AND created_at > NOW() - INTERVAL '10 seconds';
    
    RETURN recent_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view, only owner can update
CREATE POLICY "Public profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Conversations: Only participants can view
CREATE POLICY "View own conversations" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Participants: Can view all participants in conversations you're part of
-- Use a security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.user_conversation_ids()
RETURNS SETOF UUID AS $$
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "View participants in my conversations" ON public.conversation_participants
    FOR SELECT USING (
        conversation_id IN (SELECT public.user_conversation_ids())
    );

CREATE POLICY "Add participants" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: Only participants can read/send (with rate limiting)
CREATE POLICY "View messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        ) AND
        public.check_message_rate_limit()
    );
