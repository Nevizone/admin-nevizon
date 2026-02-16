"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImagePlus, Loader2, Trash2, Eye } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"

// Cloudinary Widget Type
declare global {
    interface Window {
        cloudinary: any;
    }
}

const promotionSchema = z.object({
    title: z.string().min(2, "Internal title is required"),
    type: z.string().min(1, "Type is required"),
    status: z.string().min(1, "Status is required"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    imageUrl: z.string().min(1, "Image is required for banners"),
    btnText: z.string().optional(),
    btnLink: z.string().optional(),
})

type PromotionFormValues = z.infer<typeof promotionSchema>

interface AdminPromotionFormProps {
    initialData?: PromotionFormValues & { id?: string }
}

export function AdminPromotionForm({ initialData }: AdminPromotionFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const isEditing = !!initialData

    const form = useForm<PromotionFormValues>({
        resolver: zodResolver(promotionSchema),
        defaultValues: initialData || {
            title: "",
            type: "Banner",
            status: "Scheduled",
            startDate: "",
            endDate: "",
            heading: "",
            subheading: "",
            imageUrl: "",
            btnText: "Shop Now",
            btnLink: "/products",
        },
    })

    const handleImageUpload = useCallback((info: any) => {
        form.setValue("imageUrl", info.secure_url)
        toast({
            title: "Image Uploaded",
            description: "Banner image has been successfully uploaded.",
        })
    }, [form, toast])

    const onSubmit = async (data: PromotionFormValues) => {
        setLoading(true)
        try {
            const payload = {
                title: data.title,
                type: data.type,
                status: data.status,
                start_date: data.startDate || null,
                end_date: data.endDate || null,
                heading: data.heading,
                subheading: data.subheading,
                image_url: data.imageUrl,
                btn_text: data.btnText,
                btn_link: data.btnLink,
            }

            let error

            if (isEditing && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('promotions')
                    .update(payload)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('promotions')
                    .insert([payload])
                error = insertError
            }

            if (error) throw error

            toast({
                title: isEditing ? "Promotion Updated" : "Promotion Created",
                description: "The promotion configuration has been saved.",
            })
            router.push("/admin/promotions")
            router.refresh()
        } catch (error: any) {
            console.error("Submission error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to save promotion",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const imageUrl = form.watch("imageUrl")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Campaign Details</CardTitle>
                                <CardDescription>Define the schedule and type of promotion.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Internal Campaign Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Summer Sale 2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Promotion Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Banner">Hero Banner</SelectItem>
                                                        <SelectItem value="Popup">Modal Popup</SelectItem>
                                                        <SelectItem value="Section">Featured Section</SelectItem>
                                                        <SelectItem value="Alert">Top Alert Bar</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                        <SelectItem value="Ended">Ended</SelectItem>
                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Content & Visuals</CardTitle>
                                <CardDescription>What the customer sees.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="heading"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Public Heading</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 50% OFF EVERYTHING" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subheading"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subheading / Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g. valid till stocks last..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <FormLabel>Banner Image</FormLabel>
                                    <div className="flex flex-col gap-4">
                                        {imageUrl ? (
                                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                                                <Image
                                                    src={imageUrl}
                                                    alt="Banner Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => form.setValue("imageUrl", "")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <CloudinaryUploadWidget onUpload={handleImageUpload}>
                                                <div
                                                    className="border-2 border-dashed border-input hover:border-primary cursor-pointer rounded-lg p-10 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors"
                                                >
                                                    <ImagePlus className="w-8 h-8" />
                                                    <span>Click to upload banner image</span>
                                                </div>
                                            </CloudinaryUploadWidget>
                                        )}
                                        <Input type="hidden" {...form.register("imageUrl")} />
                                        {form.formState.errors.imageUrl && (
                                            <p className="text-sm font-medium text-destructive">{form.formState.errors.imageUrl.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="btnText"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Button Label</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. SHOP NOW" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="btnLink"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Button Link</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. /category/sale" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Preview & Actions */}
                    <div className="space-y-8">
                        <Card className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> Live Preview
                                </CardTitle>
                                <CardDescription>Rough approximation of the banner.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden border bg-background shadow-sm">
                                    {/* Mock Banner Preview */}
                                    <div className="relative aspect-[21/9] bg-gray-100 flex items-center justify-center">
                                        {imageUrl ? (
                                            <Image
                                                src={imageUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No image</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4 text-white">
                                            <h3 className="text-xl font-bold mb-1">{form.watch("heading") || "Heading"}</h3>
                                            <p className="text-xs mb-3 max-w-[80%]">{form.watch("subheading") || "Subheading text goes here..."}</p>
                                            <Button size="sm" variant="default" className="bg-primary text-primary-foreground">
                                                {form.watch("btnText") || "Button"}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3 text-xs text-muted-foreground">
                                        <p><strong>Type:</strong> {form.watch("type")}</p>
                                        <p><strong>Ends:</strong> {form.watch("endDate") || "No date set"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Button type="submit" size="lg" disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Save Changes" : "Create Promotion"}
                            </Button>
                            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                                Discard & Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
