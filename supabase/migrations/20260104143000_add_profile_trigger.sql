-- ============================================
-- Add missing trigger for automatic profile creation
-- This trigger creates a profile when a new user signs up
-- ============================================

-- Create trigger for automatic profile creation on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
