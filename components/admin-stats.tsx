"use client"

import { useEffect, useState } from "react"
import { ShoppingBag, DollarSign, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminStats() {
    const [stats, setStats] = useState([
        {
            label: "Total Orders",
            value: "0",
            change: "",
            trend: "neutral",
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
        {
            label: "Total Revenue",
            value: "₹0",
            change: "",
            trend: "neutral",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            label: "Pending Orders",
            value: "0",
            change: "",
            trend: "neutral",
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100",
        },
        {
            label: "Low Stock Items",
            value: "0",
            change: "",
            trend: "neutral",
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100",
        },
    ])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true)

            // 1. Fetch Orders Metrics
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount, status')

            // 2. Fetch Low Stock Metrics
            const { count: lowStockCount, error: productsError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .lt('inventory_count', 5) // Assuming 5 is threshold for now

            if (!ordersError && !productsError && orders) {
                const totalOrders = orders.length
                const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
                const pendingOrders = orders.filter(o => o.status === 'Pending').length

                setStats([
                    {
                        label: "Total Orders",
                        value: totalOrders.toString(),
                        change: "", // To implement trend logic later
                        trend: "neutral",
                        icon: ShoppingBag,
                        color: "text-blue-600",
                        bg: "bg-blue-100",
                    },
                    {
                        label: "Total Revenue",
                        value: `₹${totalRevenue.toLocaleString()}`,
                        change: "",
                        trend: "up",
                        icon: DollarSign,
                        color: "text-green-600",
                        bg: "bg-green-100",
                    },
                    {
                        label: "Pending Orders",
                        value: pendingOrders.toString(),
                        change: "",
                        trend: "neutral",
                        icon: Clock,
                        color: "text-orange-600",
                        bg: "bg-orange-100",
                    },
                    {
                        label: "Low Stock Items",
                        value: (lowStockCount || 0).toString(),
                        change: "",
                        trend: (lowStockCount || 0) > 0 ? "down" : "neutral",
                        icon: AlertTriangle,
                        color: "text-red-600",
                        bg: "bg-red-100",
                    },
                ])
            }
            setIsLoading(false)
        }

        fetchStats()
    }, [])

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="h-32 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <div key={index} className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            {stat.change && (
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}>
                                    {stat.change}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
