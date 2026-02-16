"use client"

import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import AdminHeader from "@/components/admin-header"
import AdminAuthProvider from "@/components/admin-auth-provider"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLoginPage = pathname === "/admin/login"

    return (
        <AdminAuthProvider>
            <div className="min-h-screen bg-background flex">
                {/* Sidebar - Hide on Login Page */}
                {!isLoginPage && <AdminSidebar />}

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {!isLoginPage && <AdminHeader />}

                    <main className={`flex-1 ${isLoginPage ? "p-0" : "p-6"} overflow-y-auto`}>
                        {children}
                    </main>
                </div>
            </div>
        </AdminAuthProvider>
    )
}
