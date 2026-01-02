import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useUsers(searchQuery = '') {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user } = useAuth()

    useEffect(() => {
        async function fetchUsers() {
            if (!user) return

            // Don't show any users until user starts typing
            if (!searchQuery.trim()) {
                setUsers([])
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .neq('id', user.id)
                    .order('username')

                if (searchQuery) {
                    query = query.ilike('username', `%${searchQuery}%`)
                }

                const { data, error } = await query

                if (error) throw error
                setUsers(data || [])
            } catch (err) {
                console.error('Error fetching users:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [user, searchQuery])

    return { users, loading, error }
}
