"use client"

import { useEffect, useState } from "react"
import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) {
                setOrders(data.map(order => ({
                    id: order.id.slice(0, 8).toUpperCase(), // Short ID for display
                    fullId: order.id, // Keep full ID for linking
                    customer: order.customer_name,
                    date: format(new Date(order.created_at), "MMM d, yyyy"),
                    total: `₹${order.total_amount}`,
                    status: order.status
                })))
            } else if (error) {
                console.error("Error fetching orders:", error)
            }
            setIsLoading(false)
        }
        fetchOrders()
    }, [])

    const columns = [
        { key: "id", label: "Order ID" },
        { key: "customer", label: "Customer" },
        { key: "date", label: "Date" },
        { key: "total", label: "Total" },
        {
            key: "status",
            label: "Status",
            render: (row: any) => {
                const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
                    "Delivered": "default",
                    "Processing": "secondary",
                    "Pending": "outline",
                    "Cancelled": "destructive",
                    "Shipped": "default"
                }

                // Custom styling for specific statuses if Badge variants aren't enough
                let className = ""
                if (row.status === "Delivered") className = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                if (row.status === "Processing") className = "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                if (row.status === "Pending") className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                if (row.status === "Shipped") className = "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200"
                if (row.status === "Cancelled") className = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"

                return (
                    <Badge variant="outline" className={`border-0 ${className}`}>
                        {row.status}
                    </Badge>
                )
            }
        },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Orders"
                description="Manage customer orders"
            />
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AdminDataTable
                    columns={columns}
                    data={orders}
                    viewLink={(id) => `/admin/orders/${orders.find(o => o.id === id)?.fullId || id}`} // Use full ID for link
                />
            )}
        </div>
    )
}
