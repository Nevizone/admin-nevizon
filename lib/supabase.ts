
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // We don't throw error here to allow build to pass without env vars
    console.warn('Missing Supabase Environment Variables')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
