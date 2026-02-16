"use client"

import { useEffect, useState } from "react"
import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AdminCategoriesPage() {
    const { toast } = useToast()
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchCategories = async () => {
        setIsLoading(true)
        // Fetch categories with product count
        const { data, error } = await supabase
            .from('categories')
            .select(`
                *,
                products (count)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching categories:", error)
            toast({ title: "Error", description: "Failed to load categories", variant: "destructive" })
        } else {
            const formatted = data?.map(c => ({
                id: c.id,
                name: c.name,
                products: c.products?.[0]?.count || 0, // products is array of {count} objects
                status: "Active", // Default for now, schema doesn't have status
                isFeatured: c.is_featured,
                image: c.image_url
            })) || []
            setCategories(formatted)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        const { error } = await supabase.from('categories').delete().eq('id', id)

        if (error) {
            console.error("Delete error:", error)
            // Check for foreign key constraint (products in category)
            if (error.code === '23503') {
                toast({ title: "Cannot Delete", description: "This category contains products. Please delete or move them first.", variant: "destructive" })
            } else {
                toast({ title: "Error", description: "Failed to delete category", variant: "destructive" })
            }
        } else {
            toast({ title: "Success", description: "Category deleted successfully" })
            fetchCategories()
        }
    }

    const columns = [
        {
            key: "image",
            label: "Image",
            render: (row: any) => (
                row.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                        <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        No Img
                    </div>
                )
            )
        },
        { key: "name", label: "Category Name" },
        {
            key: "isFeatured",
            label: "Featured",
            render: (row: any) => (
                row.isFeatured ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Featured
                    </span>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                )
            )
        },
        { key: "products", label: "Products Count" },
        {
            key: "status",
            label: "Status",
            render: (row: any) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {row.status}
                </span>
            )
        },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Categories"
                description="Manage product categories and featured collections"
                actionLabel="Add Category"
                actionLink="/admin/categories/new"
            />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AdminDataTable
                    columns={columns}
                    data={categories}
                    editLink={(id) => `/admin/categories/${id}`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
