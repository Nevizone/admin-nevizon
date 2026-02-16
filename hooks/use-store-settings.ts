import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export interface StoreSettings {
    store_name: string
    support_email: string
    support_phone: string
    store_description: string
    pincodes: string[]
    free_shipping_threshold: number
    shipping_charge: number
    is_cod_enabled: boolean
    is_stripe_enabled: boolean
    razorpay_key: string
    gift_wrap_fee: number
    loyalty_rate: number
    email_alerts: boolean
    sms_alerts: boolean
    cloudinary_cloud_name: string
    cloudinary_upload_preset: string
}

export function useStoreSettings() {
    const [settings, setSettings] = useState<StoreSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('id', 1)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching settings:", error)
                } else if (data) {
                    setSettings(data)
                }
            } catch (err) {
                console.error("Unexpected error fetching settings:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return { settings, loading }
}
