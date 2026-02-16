"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function AdminLowStock() {
    const [products, setProducts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLowStock = async () => {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select('id, name, inventory_count, images')
                .lt('inventory_count', 5)
                .limit(5)

            if (!error && data) {
                setProducts(data.map(p => ({
                    ...p,
                    stock: p.inventory_count,
                    // Use first image or fallback
                    image: p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-ful h-full object-cover" /> : "📦"
                })))
            }
            setIsLoading(false)
        }
        fetchLowStock()
    }, [])

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Low Stock Alert
                </h3>
            </div>

            <div className="divide-y divide-border flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <p>No low stock items.</p>
                    </div>
                ) : (
                    products.map((product, index) => (
                        <div key={index} className="p-4 flex items-center justify-between hover:bg-secondary/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xl overflow-hidden">
                                    {typeof product.image === 'string' ? product.image : product.image}
                                </div>
                                <div>
                                    <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">Stock: <span className={product.stock === 0 ? "text-red-600 font-bold" : "text-orange-600 font-medium"}>{product.stock}</span></p>
                                </div>
                            </div>
                            <Link href={`/admin/products/${product.id}`} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium hover:bg-primary/20 transition">
                                Restock
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
