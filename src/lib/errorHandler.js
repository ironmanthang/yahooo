/**
 * Centralized error handler for Supabase errors
 */
export function handleSupabaseError(error, context = '') {
    console.error(`[${context}]`, error)

    // Auth errors - session expired
    if (error.message?.includes('JWT') || error.code === 'PGRST301') {
        window.location.href = '/login'
        return { message: 'Session expired. Please log in again.' }
    }

    // Rate limit (from our custom RLS function)
    if (error.message?.includes('rate') || error.code === '42501') {
        return { message: "You're sending messages too fast. Please slow down." }
    }

    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return { message: 'Network error. Check your connection.' }
    }

    // Permission denied
    if (error.code === '42501' || error.message?.includes('permission')) {
        return { message: 'You do not have permission to perform this action.' }
    }

    // Generic fallback
    return { message: error.message || 'Something went wrong. Please try again.' }
}
