"use client"

import AdminPageHeader from "@/components/admin-page-header"
import { AdminPromotionForm } from "@/components/admin-promotion-form"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function EditPromotionPage() {
    const params = useParams()
    const router = useRouter()
    const [promotion, setPromotion] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPromotion = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .eq('id', params.id)
                .single()

            if (error) {
                console.error("Error fetching promotion:", error)
                router.push('/admin/promotions')
            } else {
                setPromotion({
                    id: data.id,
                    title: data.title,
                    type: data.type,
                    status: data.status,
                    startDate: data.start_date,
                    endDate: data.end_date,
                    heading: data.heading,
                    subheading: data.subheading,
                    imageUrl: data.image_url,
                    btnText: data.btn_text,
                    btnLink: data.btn_link,
                })
            }
            setIsLoading(false)
        }
        if (params.id) fetchPromotion()
    }, [params.id, router])

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    }

    if (!promotion) return null

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title={`Edit Promotion`}
                description="Update campaign details and visuals."
                showBackButton
            />
            <div className="mt-6">
                <AdminPromotionForm initialData={promotion} />
            </div>
        </div>
    )
}
