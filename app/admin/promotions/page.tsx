"use client"

import { useEffect, useState } from "react"
import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPromotionsPage() {
    const { toast } = useToast()
    const [promotions, setPromotions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchPromotions = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            setPromotions(data.map(p => ({
                id: p.id,
                title: p.title,
                type: p.type,
                status: p.status,
                dates: p.start_date && p.end_date
                    ? `${format(new Date(p.start_date), "MMM d")} - ${format(new Date(p.end_date), "MMM d, yyyy")}`
                    : "Flexible"
            })))
        } else if (error) {
            console.error("Error fetching promotions:", error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchPromotions()
    }, [])

    const handleDelete = async (id: string | number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this promotion?")
        if (!confirmDelete) return

        const { error } = await supabase.from('promotions').delete().eq('id', id)
        if (error) {
            toast({ title: "Error", description: "Failed to delete promotion", variant: "destructive" })
        } else {
            toast({ title: "Success", description: "Promotion deleted" })
            fetchPromotions()
        }
    }

    const columns = [
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "dates", label: "Duration" },
        {
            key: "status",
            label: "Status",
            render: (row: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-green-100 text-green-800" :
                    row.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                        row.status === "Ended" ? "bg-gray-100 text-gray-800" :
                            "bg-yellow-100 text-yellow-800"
                    }`}>
                    {row.status}
                </span>
            )
        },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Promotions"
                description="Manage banners and offers"
                actionLabel="Add Promotion"
                actionLink="/admin/promotions/new"
            />
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AdminDataTable
                    columns={columns}
                    data={promotions}
                    editLink={(id) => `/admin/promotions/${id}`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
