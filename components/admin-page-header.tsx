"use client"

import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminPageHeaderProps {
    title: string
    description?: string
    actionLabel?: string
    actionLink?: string
    showBackButton?: boolean
}

export default function AdminPageHeader({
    title,
    description,
    actionLabel,
    actionLink,
    showBackButton
}: AdminPageHeaderProps) {
    const router = useRouter()

    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                {showBackButton && (
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
            </div>
            {actionLabel && actionLink && (
                <Link href={actionLink}>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        {actionLabel}
                    </Button>
                </Link>
            )}
        </div>
    )
}
