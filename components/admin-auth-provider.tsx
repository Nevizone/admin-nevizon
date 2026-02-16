"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

type AuthContextType = {
    session: Session | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    signOut: async () => { },
})

export const useAuth = () => useContext(AuthContext)

export default function AdminAuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Check active session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)

                // Redirect logic
                if (!session && pathname !== "/admin/login") {
                    router.replace("/admin/login")
                } else if (session && pathname === "/admin/login") {
                    router.replace("/admin")
                }
            } catch (error) {
                console.error("Auth init error:", error)
            } finally {
                setLoading(false)
            }
        }

        initSession()

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            if (!session && pathname !== "/admin/login") {
                router.replace("/admin/login")
            } else if (session && pathname === "/admin/login") {
                router.replace("/admin")
            }
        })

        return () => subscription.unsubscribe()
    }, [pathname, router])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.replace("/admin/login")
    }

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="sr-only">Loading...</span>
            </div>
        )
    }

    // If no session and not on login page, don't render children (waiting for redirect)
    if (!session && pathname !== "/admin/login") {
        return null
    }

    return (
        <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
