import AdminStats from "@/components/admin-stats"

import AdminRecentOrders from "@/components/admin-recent-orders"
import AdminLowStock from "@/components/admin-low-stock"

export default function AdminPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats */}
            <AdminStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart placeholder or removed */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[300px]">
                    <p className="text-muted-foreground">Chart temporarily disabled</p>
                </div>

                {/* Low Stock */}
                <div className="lg:col-span-1">
                    <AdminLowStock />
                </div>
            </div>

            {/* Recent Orders */}
            <AdminRecentOrders />
        </div>
    )
}
