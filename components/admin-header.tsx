import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminHeader() {
    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex items-center gap-6">
                {/* Search */}
                <div className="relative w-64 hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 h-9" />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="relative text-muted-foreground hover:text-foreground transition">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-border">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-muted-foreground">Super Admin</p>
                        </div>
                        <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
