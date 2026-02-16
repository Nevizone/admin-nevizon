"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminProductsPage() {
    const { toast } = useToast()
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchProducts = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, name, price, inventory_count, is_featured, is_new, age_group,
                categories ( name )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching products:", error)
            toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
        } else {
            // Flatten category name
            const formattedProducts = data?.map(p => ({
                ...p,
                category: p.categories?.[0]?.name || "Uncategorized",
                stock: p.inventory_count, // Map inventory_count to stock for table
                status: p.inventory_count > 0 ? "Active" : "Out of Stock"
            })) || []
            setProducts(formattedProducts)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return

        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) {
            toast({ title: "Error", description: "Failed to delete product", variant: "destructive" })
        } else {
            toast({ title: "Success", description: "Product deleted successfully" })
            fetchProducts() // Refresh list
        }
    }

    const columns = [
        { key: "name", label: "Product Name" },
        { key: "category", label: "Category" },
        { key: "age_group", label: "Age Group" },
        {
            key: "price",
            label: "Price",
            render: (row: any) => `₹${row.price}`
        },
        {
            key: "stock",
            label: "Stock",
            render: (row: any) => (
                <span className={row.stock === 0 ? "text-destructive font-bold" : ""}>
                    {row.stock}
                </span>
            )
        },
        {
            key: "flags",
            label: "Tags",
            render: (row: any) => (
                <div className="flex gap-1">
                    {row.is_featured && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">Featured</span>}
                    {row.is_new && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">New</span>}
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (row: any) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {row.status}
                </span>
            )
        },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Products"
                description="Manage your product catalog"
                actionLabel="Add Product"
                actionLink="/admin/products/new"
            />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <AdminDataTable
                    columns={columns}
                    data={products}
                    editLink={(id) => `/admin/products/${id}`}
                    onDelete={handleDelete}
                />
            )}
        </div>
    )
}
