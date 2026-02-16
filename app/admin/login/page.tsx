"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true)
        setAuthError(null)

        try {
            // 1. Sign In
            const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (signInError) throw signInError
            if (!session) throw new Error("No session created")

            // 2. Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            // 3. Handle Missing Profile (Auto-Fix Attempt)
            if (profileError || !profile) {
                console.warn("Profile missing. Attempting to create fallback profile...", profileError)

                // Construct a new profile
                const newProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || 'Admin User',
                    role: 'customer', // Default to customer for safety
                    created_at: new Date().toISOString(),
                }

                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([newProfile])

                if (insertError) {
                    console.error("Auto-create failed:", JSON.stringify(insertError))
                    throw new Error("Account exists in Auth but not in Database. Please run the SQL setup script.")
                }

                // If insert succeeded, we still aren't admin yet.
                await supabase.auth.signOut()
                throw new Error("Account created! Please manually update your role to 'admin' in Supabase database to login.")
            }

            // 4. Check Role
            if (profile.role !== 'admin') {
                await supabase.auth.signOut()
                throw new Error("Access denied. You are not an administrator.")
            }

            // 5. Success
            toast({
                title: "Login Successful",
                description: "Welcome back to the admin panel.",
            })

            router.push("/admin")
            router.refresh()

        } catch (error: any) {
            console.error("Login error:", error)

            // Friendly error messages
            let msg = error.message || "An unexpected error occurred"
            if (msg.includes("Invalid login credentials")) msg = "Invalid email or password."

            setAuthError(msg)
            toast({
                title: "Login Failed",
                description: msg,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <Lock className="w-6 h-6 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {authError && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input className="pl-9" placeholder="admin@nevizon.com" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    className="pl-9"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Authenticating..." : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Forgot your password? Contact system administrator.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
