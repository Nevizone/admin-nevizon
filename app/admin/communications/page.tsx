"use client"

import AdminPageHeader from "@/components/admin-page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Trash2, Reply } from "lucide-react"
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

export default function CommunicationsPage() {
    // Mock Data
    const subscribers = [
        { id: 1, email: "john.doe@example.com", date: "Oct 26, 2023" },
        { id: 2, email: "sarah.smith@example.com", date: "Oct 25, 2023" },
        { id: 3, email: "mike.jones@test.com", date: "Oct 24, 2023" },
        { id: 4, email: "emily.white@demo.com", date: "Oct 22, 2023" },
    ]

    const { toast } = useToast()
    const [deleteId, setDeleteId] = useState<{ type: 'inquiry' | 'subscriber', id: number } | null>(null)

    const handleReply = (id: number) => {
        toast({
            title: "Reply Sent",
            description: `Reply executed for inquiry #${id}.`,
        })
    }

    const handleDelete = () => {
        if (!deleteId) return
        toast({
            title: deleteId.type === 'inquiry' ? "Inquiry Deleted" : "Subscriber Removed",
            description: `Successfully removed from the database.`,
            variant: "destructive",
        })
        setDeleteId(null)
    }

    const inquiries = [
        { id: 1, name: "Alice Brown", email: "alice@example.com", subject: "Product Availability", message: "When will the Lego City set be back in stock?", date: "2 hours ago", status: "New" },
        { id: 2, name: "David Wilson", email: "david@example.com", subject: "Bulk Order", message: "Do you offer discounts for bulk purchases for schools?", date: "1 day ago", status: "Read" },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <AdminPageHeader
                title="Communications"
                description="Manage newsletter subscribers and customer inquiries"
            />

            <Tabs defaultValue="inquiries" className="w-full">
                <TabsList>
                    <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                    <TabsTrigger value="newsletter">Newsletter Subscribers</TabsTrigger>
                </TabsList>

                {/* Inquiries Tab */}
                <TabsContent value="inquiries" className="mt-6">
                    <div className="grid gap-4">
                        {inquiries.map((inquiry) => (
                            <Card key={inquiry.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                                {inquiry.subject}
                                                {inquiry.status === "New" && (
                                                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">New</span>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                From: <span className="font-medium text-foreground">{inquiry.name}</span> ({inquiry.email}) • {inquiry.date}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleReply(inquiry.id)}>
                                                <Reply className="w-4 h-4" /> Reply
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId({ type: 'inquiry', id: inquiry.id })}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 bg-secondary/30 p-3 rounded-md">
                                        {inquiry.message}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Newsletter Tab */}
                <TabsContent value="newsletter" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Subscribers List</CardTitle>
                            <CardDescription>View and manage your email marketing audience.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary text-secondary-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Email Address</th>
                                            <th className="p-4 font-medium">Subscribed Date</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub) => (
                                            <tr key={sub.id} className="border-t border-border hover:bg-secondary/10">
                                                <td className="p-4 font-medium flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    {sub.email}
                                                </td>
                                                <td className="p-4 text-muted-foreground">{sub.date}</td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId({ type: 'subscriber', id: sub.id })}>
                                                        Unsubscribe
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove the record.
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
