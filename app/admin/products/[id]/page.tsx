"use client"

import AdminProductForm from "@/components/admin-product-form"
import { useParams } from "next/navigation"

export default function EditProductPage() {
    const params = useParams()

    // Mock Data for specific product
    const productData = {
        name: "Plush Teddy Bear",
        description: "A soft and cuddly teddy bear.",
        price: "599",
        stock: "12",
        category: "toys",
        ageGroup: "3-5 Years",
        brand: "ToyCo",
        colors: "Brown, Beige",
        sizes: "Standard",
        images: ["/images/teddy.jpg"]
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <AdminProductForm initialData={productData} isEditing />
        </div>
    )
}
