"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { X, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"

const categorySchema = z.object({
    name: z.string().min(2, "Name is required"),
    slug: z.string().min(2, "Slug is required"),
    description: z.string().optional(),
    parentId: z.string().optional(),
    isFeatured: z.boolean(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AdminCategoryFormProps {
    initialData?: any
    isEditing?: boolean
}

export default function AdminCategoryForm({ initialData, isEditing = false }: AdminCategoryFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || initialData?.image || "")
    const [categories, setCategories] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            parentId: initialData?.parent_id || "",
            isFeatured: initialData?.is_featured === true,
            metaTitle: initialData?.meta_title || "",
            metaDescription: initialData?.meta_description || "",
        }
    })

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, name')
            if (data) {
                // Filter out self if editing to prevent parent=self loop
                const filtered = isEditing ? data.filter(c => c.id !== initialData?.id) : data
                setCategories(filtered)
            }
        }
        fetchCategories()
    }, [isEditing, initialData])


    const onUpload = (result: any) => {
        setImageUrl(result.secure_url)
    }

    const removeImage = () => {
        setImageUrl("")
    }

    const onSubmit = async (data: CategoryFormValues) => {
        setIsSubmitting(true)
        try {
            const payload = {
                name: data.name,
                slug: data.slug,
                description: data.description,
                parent_id: data.parentId === "" ? null : data.parentId,
                is_featured: data.isFeatured,
                meta_title: data.metaTitle,
                meta_description: data.metaDescription,
                image_url: imageUrl
            }

            let error;

            if (isEditing && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('categories')
                    .update(payload)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('categories')
                    .insert([payload])
                error = insertError
            }

            if (error) {
                // Handle duplicate slug error specifically
                if (error.code === '23505') {
                    form.setError('slug', { message: "This slug is already taken. Please choose another." })
                    throw new Error("Slug already exists")
                }
                throw error
            }

            toast({
                title: isEditing ? "Category Updated" : "Category Created",
                description: `Successfully ${isEditing ? "updated" : "created"} ${data.name}.`,
            })
            router.push("/admin/categories")
            router.refresh()

        } catch (error: any) {
            console.error("Category Submit Error:", error)
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Auto-generate slug from name if slug is empty
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        form.setValue("name", name)
        if (!isEditing && !form.getValues("slug")) {
            form.setValue("slug", name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""))
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Category" : "Create Category"}</h2>
                    <p className="text-muted-foreground">
                        {isEditing ? "Update category details." : "Add a new category to your store."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? "Save Changes" : "Create Category"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic details about the category.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category Name</Label>
                                <Input
                                    {...form.register("name")}
                                    placeholder="e.g. Action Figures"
                                    onChange={handleNameChange}
                                />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (URL Friendly)</Label>
                                <Input {...form.register("slug")} placeholder="e.g. action-figures" />
                                {form.formState.errors.slug && <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...form.register("description")} placeholder="Category description used for SEO and display..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Parent Category (Optional)</Label>
                                <select {...form.register("parentId")} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="">None (Top Level)</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Featured Category</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Show this category on the homepage.
                                    </p>
                                </div>
                                <Switch
                                    checked={form.watch("isFeatured")}
                                    onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                            <CardDescription>Optimize for search engines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Meta Title</Label>
                                <Input {...form.register("metaTitle")} placeholder="e.g. Best Action Figures Online - Nevizon" />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Description</Label>
                                <Textarea {...form.register("metaDescription")} placeholder="SEO description..." />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Image</CardTitle>
                            <CardDescription>Banner or Thumbnail image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <CloudinaryUploadWidget onUpload={onUpload} />

                            {imageUrl ? (
                                <div className="relative aspect-video w-full border rounded-lg overflow-hidden group mt-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={removeImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground mt-4">
                                    <p>No image uploaded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
