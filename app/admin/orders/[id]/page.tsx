"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Truck, CheckCircle, Printer, Download, CreditCard, RotateCcw, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

const ORDER_STATUSES = [
    { value: "Pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "Processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
    { value: "Shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
    { value: "Delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "Cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
]

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [order, setOrder] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
    const [status, setStatus] = useState("")
    const [paymentStatus, setPaymentStatus] = useState("")

    const fetchOrder = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products ( name, images )
                )
            `)
            .eq('id', params.id)
            .single()

        if (error) {
            console.error("Error fetching order:", error)
            toast({ title: "Error", description: "Could not load order details", variant: "destructive" })
            router.push('/admin/orders')
        } else {
            setOrder(data)
            setStatus(data.status)
            setPaymentStatus(data.payment_status)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (params.id) fetchOrder()
    }, [params.id])


    const handleStatusUpdate = async (newStatus: string, type: 'status' | 'payment_status') => {
        const { error } = await supabase
            .from('orders')
            .update({ [type]: newStatus })
            .eq('id', params.id)

        if (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } else {
            if (type === 'status') setStatus(newStatus)
            if (type === 'payment_status') setPaymentStatus(newStatus)
            toast({ title: "Success", description: "Order updated successfully" })
            fetchOrder() // Refresh to ensure sync
        }
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    }

    if (!order) return null

    const InvoiceView = () => (
        <div className="p-6 md:p-10 bg-white text-black font-mono text-sm">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
                    <p>Nevizon Inc.</p>
                    <p>123 Toy Street, Fun City</p>
                    <p>GSTIN: 29ABCDE1234F1Z5</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p>Date: {format(new Date(order.created_at), "MMM d, yyyy")}</p>
                </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold mb-2">Bill To:</h3>
                        <p>{order.customer_name}</p>
                        <p>{order.shipping_address?.line1}</p>
                        <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.zip}</p>
                        <p>Ph: {order.customer_phone}</p>
                        {order.gstin && <p className="mt-1 font-semibold">GSTIN: {order.gstin}</p>}
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold mb-2">Payment:</h3>
                        <p>{paymentStatus}</p>
                        <p>Via: {order.payment_method}</p>
                    </div>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left py-2">Item</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.order_items.map((item: any) => (
                        <tr key={item.id}>
                            <td className="py-2">{item.products?.name || "Unknown Product"} <br /><span className="text-xs text-gray-500">{item.variant_color} {item.variant_size}</span></td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right">₹{item.price_at_purchase}</td>
                            <td className="text-right">₹{item.price_at_purchase * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between font-bold text-lg border-t border-black pt-2">
                        <span>Grand Total</span>
                        <span>₹{order.total_amount}</span>
                    </div>
                    <div className="text-xs text-right pt-1">
                        (Inclusive of all taxes)
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-gray-500 text-xs">
                <p>Thank you for shopping with Nevizon!</p>
                <p>For support, email help@nevizon.com</p>
            </div>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                            <Badge variant={paymentStatus === "Paid" ? "default" : "destructive"}>
                                {paymentStatus}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            Placed on {format(new Date(order.created_at), "MMM d, yyyy • hh:mm a")}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Printer className="w-4 h-4" /> Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Order Invoice</DialogTitle>
                                <DialogDescription>
                                    View or print order receipt.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="border rounded-md overflow-hidden">
                                <InvoiceView />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsInvoiceOpen(false)}>Close</Button>
                                <Button onClick={() => window.print()} className="gap-2">
                                    <Download className="w-4 h-4" /> Print / PDF
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Select value={status} onValueChange={(val) => handleStatusUpdate(val, 'status')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Workflow & Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Workflow */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-6 border-l-2 border-muted ml-2 space-y-8">
                                <div className={`relative ${["Pending", "Processing", "Shipped", "Delivered"].includes(status) ? "opacity-100" : "opacity-40"}`}>
                                    <span className="absolute -left-[29px] bg-background border-2 border-primary rounded-full p-1">
                                        <Package className="w-3 h-3 text-primary" />
                                    </span>
                                    <p className="font-semibold text-sm">Order Placed</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM d, hh:mm a")}</p>
                                </div>
                                <div className={`relative ${["Processing", "Shipped", "Delivered"].includes(status) ? "opacity-100" : "opacity-40"}`}>
                                    <span className="absolute -left-[29px] bg-background border-2 border-primary rounded-full p-1">
                                        <CreditCard className="w-3 h-3 text-primary" />
                                    </span>
                                    <p className="font-semibold text-sm">Processing</p>
                                    <p className="text-xs text-muted-foreground">Order confirmed</p>
                                </div>
                                <div className={`relative ${["Shipped", "Delivered"].includes(status) ? "opacity-100" : "opacity-40"}`}>
                                    <span className="absolute -left-[29px] bg-background border-2 border-primary rounded-full p-1">
                                        <Truck className="w-3 h-3 text-primary" />
                                    </span>
                                    <p className="font-semibold text-sm">Shipped</p>
                                    <p className="text-xs text-muted-foreground">Dispatched</p>
                                </div>
                                <div className={`relative ${status === "Delivered" ? "opacity-100" : "opacity-40"}`}>
                                    <span className="absolute -left-[29px] bg-background border-2 border-green-600 rounded-full p-1">
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                    </span>
                                    <p className="font-semibold text-sm">Delivered</p>
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.order_items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                                        {item.products?.images?.[0] ?
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                                            : "Img"
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.products?.name || "Unknown Product"}</p>
                                        <p className="text-sm text-muted-foreground">{item.variant_color ? `Color: ${item.variant_color}` : ""} {item.variant_size ? `Size: ${item.variant_size}` : ""}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{item.price_at_purchase}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between font-bold text-lg">
                                <span>Grand Total</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Customer Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Status</label>
                                <Select value={paymentStatus} onValueChange={(val) => handleStatusUpdate(val, 'payment_status')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        <SelectItem value="Refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Process Refund
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="font-medium">{order.customer_name}</div>
                                <div className="text-muted-foreground">
                                    {order.shipping_address?.line1},<br />
                                    {order.shipping_address?.city},<br />
                                    {order.shipping_address?.state} - {order.shipping_address?.zip}
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="font-medium">Ph:</span>
                                    <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">{order.customer_phone}</a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
