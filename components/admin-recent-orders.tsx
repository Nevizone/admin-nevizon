"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import Link from "next/link"

export default function AdminRecentOrders() {
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select('id, customer_name, created_at, total_amount, status, payment_status')
                .order('created_at', { ascending: false })
                .limit(5)

            if (!error && data) {
                setOrders(data.map(o => ({
                    id: o.id.slice(0, 8).toUpperCase(), // Short ID
                    fullId: o.id,
                    customer: o.customer_name,
                    date: format(new Date(o.created_at), "MMM d, yyyy"),
                    total: `₹${o.total_amount}`,
                    status: o.status,
                    payment: o.payment_status
                })))
            }
            setIsLoading(false)
        }
        fetchOrders()
    }, [])

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold">Recent Orders</h3>
                <Link href="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Order ID</th>
                            <th className="px-6 py-3 font-medium">Customer</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Total</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Payment</th>
                            <th className="px-6 py-3 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.fullId} className="hover:bg-secondary/20">
                                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                                    <td className="px-6 py-4">{order.customer}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                                    <td className="px-6 py-4 font-medium">{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "Delivered" ? "bg-green-100 text-green-800" :
                                            order.status === "Processing" ? "bg-blue-100 text-blue-800" :
                                                order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                                    "bg-red-100 text-red-800"
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.payment === "Paid" ? "bg-green-100 text-green-800" :
                                            order.payment === "Unpaid" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-gray-100 text-gray-800"
                                            }`}>
                                            {order.payment}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/orders/${order.fullId}`} className="text-muted-foreground hover:text-foreground">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
