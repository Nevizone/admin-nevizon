"use client"

import AdminCategoryForm from "@/components/admin-category-form"
import { useParams } from "next/navigation"

export default function EditCategoryPage() {
    const params = useParams()

    // Mock Data for specific category based on ID
    // In a real app, you would fetch this from the API
    const categoryData = {
        name: "Action Figures",
        slug: "action-figures",
        description: "Superheroes, villains, and collectibles.",
        parentId: "1", // "Toys"
        isFeatured: true,
        image: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
        metaTitle: "Buy Action Figures - Nevizon",
        metaDescription: "Shop the best action figures online.",
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <AdminCategoryForm initialData={categoryData} isEditing />
        </div>
    )
}
