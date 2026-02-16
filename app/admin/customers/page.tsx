"use client"

import { useEffect, useState } from "react"
import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'customer')
                .order('created_at', { ascending: false })

            if (data) {
                setCustomers(data.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || "Unknown",
                    email: profile.email,
                    orders: profile.orders_count || 0,
                    spent: `₹${(profile.total_spent || 0).toLocaleString()}`,
                    coins: profile.coins || 0
                })))
            } else if (error) {
                console.error("Error fetching customers:", error)
            }
            setIsLoading(false)
        }
        fetchCustomers()
    }, [])

    const columns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "orders", label: "Total Orders" },
        { key: "spent", label: "Total Spent" },
        {
            key: "coins",
            label: "Loyalty Coins",
            render: (row: any) => (
                <span className="font-bold text-yellow-600 flex items-center gap-1">
                    {row.coins} 🪙
                </span>
            )
        },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Customers"
                description="View and manage customer base & loyalty"
            />
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AdminDataTable
                    columns={columns}
                    data={customers}
                    // onDelete={(id) => alert(`Block customer ${id}`)} // Block logic later
                    editLink={(id) => `/admin/customers/${id}`}
                />
            )}
        </div>
    )
}
