"use client"

import AdminPageHeader from "@/components/admin-page-header"
import AdminDataTable from "@/components/admin-data-table"
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ReviewsPage() {
    // Mock Data
    const reviews = [
        { id: 1, product: "Classic Building Blocks", user: "Alice M.", rating: 5, comment: "My kids love it! Great quality.", date: "Oct 26, 2023", status: "Approved" },
        { id: 2, product: "Remote Control Car", user: "Bob D.", rating: 4, comment: "Fast but battery drains quickly.", date: "Oct 25, 2023", status: "Pending" },
        { id: 3, product: "Plush Teddy Bear", user: "Charlie", rating: 5, comment: "So soft and cuddly.", date: "Oct 24, 2023", status: "Approved" },
        { id: 4, product: "Science Kit", user: "David", rating: 2, comment: "Missing parts in the box.", date: "Oct 23, 2023", status: "Pending" },
    ]

    const { toast } = useToast()
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const handleApprove = (id: number) => {
        toast({
            title: "Review Approved",
            description: `Review #${id} has been approved and published.`,
        })
    }

    const handleDelete = () => {
        toast({
            title: "Review Deleted",
            description: `Review #${deleteId} has been permanently removed.`,
            variant: "destructive",
        })
        setDeleteId(null)
    }

    const columns = [
        { key: "product", label: "Product" },
        { key: "user", label: "User" },
        {
            key: "rating",
            label: "Rating",
            render: (row: any) => (
                <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < row.rating ? "fill-current" : "text-gray-300"}`} />
                    ))}
                </div>
            )
        },
        { key: "comment", label: "Comment" },
        {
            key: "status",
            label: "Status",
            render: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (row: any) => (
                <div className="flex gap-2">
                    {row.status === "Pending" && (
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(row.id)}>
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteId(row.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <AdminPageHeader
                title="Reviews"
                description="Moderate customer reviews and ratings"
            />
            <AdminDataTable
                columns={columns}
                data={reviews}
            />
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
