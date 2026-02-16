"use client"

import {
    LayoutDashboard,
    Package,
    List,
    ShoppingCart,
    Users,
    Megaphone,
    Settings,
    LogOut,
    Sparkles,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/admin-auth-provider"

export default function AdminSidebar() {
    const pathname = usePathname()
    const { signOut } = useAuth()

    const menuItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: List },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/promotions", label: "Banners / Promotions", icon: Megaphone },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className="w-64 bg-card border-r border-border h-screen flex-col hidden md:flex sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/admin" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Sparkles className="w-6 h-6 fill-primary" />
                    Nevizon Admin
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    )
}
