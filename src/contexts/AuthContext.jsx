import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Only use onAuthStateChange - it fires immediately with INITIAL_SESSION
        // This is the recommended approach per Supabase docs
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[Auth] onAuthStateChange:', event, session?.user?.email)

                if (session?.user) {
                    setUser(session.user)
                    // Use setTimeout to avoid Supabase deadlock issue
                    setTimeout(() => {
                        fetchProfile(session.user.id)
                    }, 0)
                } else {
                    setUser(null)
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        console.log('[Auth] Fetching profile for:', userId)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('[Auth] Profile fetch error:', error)
            } else {
                console.log('[Auth] Profile loaded:', data?.username)
                setProfile(data)
            }
        } catch (err) {
            console.error('[Auth] Profile fetch exception:', err)
        } finally {
            setLoading(false)
        }
    }

    async function signUp(email, password, username) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        })

        if (error) throw error
        return data
    }

    async function signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
        return data
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    async function updateProfile(updates) {
        if (!user) throw new Error('No user logged in')

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

        if (error) throw error
        setProfile(data)
        return data
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
