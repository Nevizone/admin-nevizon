"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Loader2, Save } from "lucide-react"

interface StoreSettings {
    id?: number
    // General
    store_name: string
    support_email: string
    support_phone: string
    store_description: string

    // Shipping
    pincodes: string[]
    free_shipping_threshold: number
    shipping_charge: number

    // Payment Methods
    is_cod_enabled: boolean
    is_stripe_enabled: boolean
    razorpay_key: string

    // COD Convenience Fee
    enable_cod_fee: boolean
    cod_fee_type: 'percentage' | 'fixed'
    cod_fee_percentage: number
    cod_fee_fixed: number
    cod_fee_min_order: number

    // Additional
    gift_wrap_fee: number
    loyalty_rate: number
    email_alerts: boolean
    sms_alerts: boolean

    // Media
    cloudinary_cloud_name: string
    cloudinary_upload_preset: string
}

export default function AdminSettings() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Default state with all fields
    const [settings, setSettings] = useState<StoreSettings>({
        store_name: "Nevizon",
        support_email: "",
        support_phone: "",
        store_description: "",
        pincodes: [],
        free_shipping_threshold: 999,
        shipping_charge: 100,
        is_cod_enabled: true,
        is_stripe_enabled: false,
        razorpay_key: "",
        enable_cod_fee: false,
        cod_fee_type: 'percentage',
        cod_fee_percentage: 2,
        cod_fee_fixed: 0,
        cod_fee_min_order: 0,
        gift_wrap_fee: 50,
        loyalty_rate: 1,
        email_alerts: true,
        sms_alerts: false,
        cloudinary_cloud_name: "",
        cloudinary_upload_preset: "",
    })

    const [pincodesText, setPincodesText] = useState("")

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', 1)
                .single()

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error('Error fetching settings:', error)
                    toast({
                        title: "Error Loading Settings",
                        description: "Please check if your database schema is updated.",
                        variant: "destructive",
                    })
                }
                // Maintain default state if no row found (or create one later)
            } else if (data) {
                setSettings({
                    ...settings,
                    ...data,
                    // Ensure pincodes is an array
                    pincodes: data.pincodes || []
                })
                setPincodesText(data.pincodes?.join(', ') || '')
            }
        } catch (err) {
            console.error('Unexpected error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const pincodesArray = pincodesText
                .split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0)

            const payload = {
                ...settings,
                pincodes: pincodesArray,
            }

            const { error } = await supabase
                .from('settings')
                .upsert([{ id: 1, ...payload }])

            if (error) throw error

            toast({
                title: "Settings Saved",
                description: "All store settings updated successfully.",
            })
        } catch (error: any) {
            console.error('Error saving settings:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to save settings",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    // Preview Calculation for COD
    const sampleOrderTotal = 1000
    const calculateCODFee = () => {
        if (!settings.enable_cod_fee) return 0
        if (sampleOrderTotal < settings.cod_fee_min_order) return 0
        return settings.cod_fee_type === 'percentage'
            ? (sampleOrderTotal * settings.cod_fee_percentage) / 100
            : settings.cod_fee_fixed
    }
    const codFee = calculateCODFee()

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            {/* 1. Store Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>General details about your store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Store Name</Label>
                        <Input
                            value={settings.store_name}
                            onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            rows={2}
                            value={settings.store_description}
                            onChange={e => setSettings({ ...settings, store_description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input
                                value={settings.support_email}
                                onChange={e => setSettings({ ...settings, support_email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Phone</Label>
                            <Input
                                value={settings.support_phone}
                                onChange={e => setSettings({ ...settings, support_phone: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Shipping Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Shipping & Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Base Shipping Charge (₹)</Label>
                            <Input
                                type="number"
                                value={settings.shipping_charge}
                                onChange={e => setSettings({ ...settings, shipping_charge: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Free Shipping Above (₹)</Label>
                            <Input
                                type="number"
                                value={settings.free_shipping_threshold}
                                onChange={e => setSettings({ ...settings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Serviceable Pincodes (Comma separated)</Label>
                        <Textarea
                            value={pincodesText}
                            onChange={e => setPincodesText(e.target.value)}
                            placeholder="e.g. 400001, 400050"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Payment & COD Fees */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Configuration</CardTitle>
                    <CardDescription>Manage payment methods and COD fees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Payment Toggles */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <Label>Enable COD</Label>
                            <Switch
                                checked={settings.is_cod_enabled}
                                onCheckedChange={c => setSettings({ ...settings, is_cod_enabled: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <Label>Enable Stripe</Label>
                            <Switch
                                checked={settings.is_stripe_enabled}
                                onCheckedChange={c => setSettings({ ...settings, is_stripe_enabled: c })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* COD Fee Section */}
                    {settings.is_cod_enabled && (
                        <div className="space-y-4 bg-secondary/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">COD Convenience Fee</Label>
                                <Switch
                                    checked={settings.enable_cod_fee}
                                    onCheckedChange={c => setSettings({ ...settings, enable_cod_fee: c })}
                                />
                            </div>

                            {settings.enable_cod_fee && (
                                <div className="space-y-4 pl-2 border-l-2 border-primary/20 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                        <Label>Fee Type</Label>
                                        <RadioGroup
                                            value={settings.cod_fee_type}
                                            onValueChange={(v: 'percentage' | 'fixed') => setSettings({ ...settings, cod_fee_type: v })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="percentage" id="pct" />
                                                <Label htmlFor="pct">Percentage (%)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="fixed" id="fix" />
                                                <Label htmlFor="fix">Fixed Amount (₹)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>
                                                {settings.cod_fee_type === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                                            </Label>
                                            <Input
                                                type="number"
                                                step={settings.cod_fee_type === 'percentage' ? "0.1" : "1"}
                                                value={settings.cod_fee_type === 'percentage' ? settings.cod_fee_percentage : settings.cod_fee_fixed}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value) || 0
                                                    if (settings.cod_fee_type === 'percentage') {
                                                        setSettings({ ...settings, cod_fee_percentage: val })
                                                    } else {
                                                        setSettings({ ...settings, cod_fee_fixed: val })
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Minimum Order Value (₹)</Label>
                                            <Input
                                                type="number"
                                                value={settings.cod_fee_min_order}
                                                onChange={e => setSettings({ ...settings, cod_fee_min_order: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>

                                    {/* Preview Box */}
                                    <div className="bg-card border rounded p-3 text-sm space-y-1">
                                        <p className="font-semibold text-muted-foreground">Preview (Order ₹1,000)</p>
                                        <div className="flex justify-between">
                                            <span>COD Fee:</span>
                                            <span className="font-mono font-bold text-red-500">+₹{codFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1 mt-1">
                                            <span>Total:</span>
                                            <span>₹{(1000 + codFee).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 4. API Keys & Media */}
            <Card>
                <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Razorpay Key ID</Label>
                        <Input
                            value={settings.razorpay_key || ''}
                            onChange={e => setSettings({ ...settings, razorpay_key: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cloudinary Cloud Name</Label>
                            <Input
                                value={settings.cloudinary_cloud_name || ''}
                                onChange={e => setSettings({ ...settings, cloudinary_cloud_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cloudinary Preset</Label>
                            <Input
                                value={settings.cloudinary_upload_preset || ''}
                                onChange={e => setSettings({ ...settings, cloudinary_upload_preset: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="sticky bottom-4 flex justify-end">
                <Button type="submit" size="lg" disabled={saving} className="shadow-xl">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Settings
                </Button>
            </div>
        </form>
    )
}
