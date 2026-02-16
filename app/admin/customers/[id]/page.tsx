"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Mail, Phone, MapPin, Package, Coins, Save, Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

export default function CustomerDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // State for Customer Data
    const [customer, setCustomer] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [addresses, setAddresses] = useState<any[]>([])

    // Tag state
    const [newTag, setNewTag] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)

            // 1. Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.id)
                .single()

            if (profileError) {
                console.error("Error fetching profile:", profileError)
                toast({ title: "Error", description: "Customer not found", variant: "destructive" })
                router.push('/admin/customers')
                return
            }

            // 2. Fetch Orders
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', params.id)
                .order('created_at', { ascending: false })

            if (orderError) console.error("Error fetching orders:", orderError)

            setCustomer(profile)
            setOrders(orderData || [])

            // 3. Extract Unique Addresses from Orders
            if (orderData) {
                const uniqueAddresses: any[] = []
                const seenKeys = new Set()

                orderData.forEach(o => {
                    if (o.shipping_address) {
                        const key = `${o.shipping_address.line1}-${o.shipping_address.zip}`
                        if (!seenKeys.has(key)) {
                            seenKeys.add(key)
                            uniqueAddresses.push({ ...o.shipping_address, type: "Shipping" }) // Tagging as Shipping for now
                        }
                    }
                })
                setAddresses(uniqueAddresses.slice(0, 3)) // Limit to top 3
            }

            setIsLoading(false)
        }
        fetchData()
    }, [params.id, router, toast])


    const handleSave = async () => {
        setIsSaving(true)
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone,
                coins: customer.coins,
                notes: customer.notes,
                tags: customer.tags
            })
            .eq('id', customer.id)

        setIsSaving(false)

        if (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to update profile", variant: "destructive" })
        } else {
            setIsEditing(false)
            toast({
                title: "Customer Updated",
                description: "Profile changes have been saved successfully.",
            })
        }
    }

    const addTag = () => {
        if (newTag && !customer.tags?.includes(newTag)) {
            const updatedTags = [...(customer.tags || []), newTag]
            setCustomer({ ...customer, tags: updatedTags })
            setNewTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        const updatedTags = customer.tags.filter((t: string) => t !== tagToRemove)
        setCustomer({ ...customer, tags: updatedTags })
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    }

    if (!customer) return null

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/customers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{customer.full_name || "Unknown"}</h1>
                        <p className="text-muted-foreground">ID: {customer.id.slice(0, 8)}... • Joined {format(new Date(customer.created_at), "MMM d, yyyy")}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                        <Package className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold">{customer.orders_count || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                        <span className="font-bold">₹</span>
                    </div>
                    <p className="text-3xl font-bold">{(customer.total_spent || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-3">
                        <Coins className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold">{customer.coins || 0}</p>
                    <p className="text-sm text-muted-foreground">Loyalty Balance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile & Notes */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    disabled={!isEditing}
                                    value={customer.full_name || ""}
                                    onChange={(e) => setCustomer({ ...customer, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        disabled={!isEditing}
                                        value={customer.email || ""}
                                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        disabled={!isEditing}
                                        value={customer.phone || ""}
                                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Loyalty Coins</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        disabled={!isEditing}
                                        value={customer.coins || 0}
                                        onChange={(e) => setCustomer({ ...customer, coins: parseInt(e.target.value) || 0 })}
                                    />
                                    {isEditing && (
                                        <Button variant="outline" size="icon" title="Add Bonus" onClick={() => setCustomer({ ...customer, coins: (customer.coins || 0) + 10 })}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">Manually adjust for refunds/bonus.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Data</CardTitle>
                            <CardDescription>Private notes and classification.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(customer.tags || []).map((tag: string) => (
                                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                            {tag}
                                            {isEditing && (
                                                <X
                                                    className="w-3 h-3 hover:text-destructive cursor-pointer"
                                                    onClick={() => removeTag(tag)}
                                                />
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add tag..."
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                        />
                                        <Button type="button" size="sm" onClick={addTag}>Add</Button>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Internal Notes</Label>
                                <Textarea
                                    className="min-h-[100px]"
                                    disabled={!isEditing}
                                    value={customer.notes || ""}
                                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                                    placeholder="Add private notes about this customer..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Addresses & Orders */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Address Book */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Addresses</CardTitle>
                            <CardDescription>Extracted from recent orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {addresses.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No addresses found.</p>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {addresses.map((addr, i) => (
                                        <div key={i} className="p-4 border rounded-lg relative bg-card">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                                <div className="text-sm">
                                                    <p className="font-semibold mb-1">{addr.type} Address</p>
                                                    <p className="text-muted-foreground">{addr.line1}</p>
                                                    {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                                                    <p className="text-muted-foreground">{addr.city}, {addr.state}</p>
                                                    <p className="font-medium mt-1">{addr.zip}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {orders.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No orders yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <Link key={order.id} href={`/admin/orders/${order.id}`}>
                                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center group-hover:bg-background transition-colors">
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium group-hover:underline">{order.id.slice(0, 8).toUpperCase()}</p>
                                                        <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), "MMM d, yyyy")} • ₹{order.total_amount}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">₹{order.total_amount}</p>
                                                    <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <Button variant="outline" className="w-full mt-4" asChild>
                                <Link href={`/admin/orders`}>View All Global Orders</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
