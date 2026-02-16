"use client"

import AdminPageHeader from "@/components/admin-page-header"
import { AdminPromotionForm } from "@/components/admin-promotion-form"

export default function NewPromotionPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Create Promotion"
                description="Launch a new marketing campaign."
                showBackButton
            />
            <div className="mt-6">
                <AdminPromotionForm />
            </div>
        </div>
    )
}
