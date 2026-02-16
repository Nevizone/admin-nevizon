"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CloudinaryUploadWidget from "@/components/cloudinary-upload-widget"
import { X, Save, Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// Helper to generate slug
const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

const productSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    brand: z.string().optional(),
    category_id: z.string().min(1, "Category is required"), // Changed from category to category_id
    age_group: z.string().optional(), // Changed from ageGroup
    price: z.string().refine((val) => !Number.isNaN(parseFloat(val)), { // Changed parseInt to parseFloat
        message: "Expected valid price"
    }),
    sale_price: z.string().optional(), // Changed from salePrice
    sku: z.string().optional(),
    barcode: z.string().optional(),
    inventory_count: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), { // Changed stock to inventory_count
        message: "Expected number for stock"
    }),
    low_stock_threshold: z.string().optional(), // Changed from lowStockThreshold

    // Specs
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    material: z.string().optional(),
    colors: z.string().optional(),
    sizes: z.string().optional(),

    // SEO
    meta_title: z.string().optional(), // Changed from metaTitle
    meta_description: z.string().optional(), // Changed from metaDescription
    slug: z.string().optional(),

    // New Fields
    highlights: z.array(z.object({ value: z.string() })).optional(),
    specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
    origin: z.string().optional(),
    manufacturer: z.string().optional(),
    warranty: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface AdminProductFormProps {
    initialData?: any
    isEditing?: boolean
}

export default function AdminProductForm({ initialData, isEditing = false }: AdminProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [images, setImages] = useState<string[]>(initialData?.images || [])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categories, setCategories] = useState<any[]>([])

    // Fetch Categories on Mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from('categories').select('id, name')
            if (error) {
                console.error("Error fetching categories:", error)
                toast({ title: "Error", description: "Failed to load categories", variant: "destructive" })
            } else {
                setCategories(data || [])
            }
        }
        fetchCategories()
    }, [toast])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            // Map DB columns to Form fields
            price: initialData?.price ? String(initialData.price) : "",
            sale_price: initialData?.sale_price ? String(initialData.sale_price) : "",
            inventory_count: initialData?.inventory_count ? String(initialData.inventory_count) : "",
            category_id: initialData?.category_id || "",
            age_group: initialData?.age_group || "",
            brand: initialData?.brand || "",
            sku: initialData?.sku || "",
            barcode: initialData?.barcode || "",
            low_stock_threshold: initialData?.low_stock_threshold ? String(initialData.low_stock_threshold) : "5",
            dimensions: initialData?.dimensions || "",
            weight: initialData?.weight || "",
            material: initialData?.material || "",
            colors: initialData?.colors || "",
            sizes: initialData?.sizes || "",
            slug: initialData?.slug || "",
            meta_title: initialData?.meta_title || "",
            meta_description: initialData?.meta_description || "",
            origin: initialData?.origin || "",
            manufacturer: initialData?.manufacturer || "",
            warranty: initialData?.warranty || "",

            // Handle JSON/Array fields
            highlights: initialData?.highlights?.map((h: string) => ({ value: h })) || [{ value: "" }],
            specifications: initialData?.specs ?
                Object.entries(initialData.specs).map(([key, value]) => ({ key, value: String(value) }))
                : [{ key: "", value: "" }],
        }
    })

    const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
        control: form.control,
        name: "highlights",
    })

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control: form.control,
        name: "specifications",
    })

    const onUpload = (result: any) => {
        setImages((prev) => [...prev, result.secure_url])
    }

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url))
    }

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)
        try {
            // 1. Prepare Data Payload
            const cleanHighlights = data.highlights
                ?.filter(h => h.value.trim() !== "")
                .map(h => h.value) || []

            const cleanSpecs = data.specifications
                ?.filter(s => s.key.trim() !== "" && s.value.trim() !== "")
                .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {}

            const generatedSlug = data.slug || generateSlug(data.name)

            const payload = {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
                inventory_count: parseInt(data.inventory_count),
                category_id: data.category_id,
                images: images,
                brand: data.brand,
                sku: data.sku,
                barcode: data.barcode,
                low_stock_threshold: parseInt(data.low_stock_threshold || "5"),
                dimensions: data.dimensions,
                weight: data.weight,
                material: data.material,
                colors: data.colors,
                sizes: data.sizes,
                slug: generatedSlug,
                meta_title: data.meta_title,
                meta_description: data.meta_description,
                origin: data.origin,
                manufacturer: data.manufacturer,
                warranty: data.warranty,
                age_group: data.age_group,
                highlights: cleanHighlights,
                specs: cleanSpecs,
                // created_at is handled by DB default
            }

            // 2. Insert or Update to Supabase
            let error
            if (isEditing && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload])
                error = insertError
            }

            if (error) throw error

            toast({
                title: isEditing ? "Product Updated" : "Product Created",
                description: `Successfully ${isEditing ? "updated" : "created"} ${data.name}.`,
            })
            router.push("/admin/products")
            router.refresh()

        } catch (error: any) {
            console.error("Submission error:", error)
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{isEditing ? "Edit Product" : "Create Product"}</h2>
                    <p className="text-muted-foreground">
                        {isEditing ? "Update your product details and settings." : "Add a new product to your catalog."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? "Save Changes" : "Create Product"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="specs">Specs</TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* GENERAL TAB */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic details about the product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input {...form.register("name")} placeholder="e.g. Super Robot Action Figure" />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...form.register("description")} className="min-h-[120px]" placeholder="Detailed product description..." />
                            </div>

                            {/* NEW: Highlights / Key Features */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>About this item (Key Features)</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendHighlight({ value: "" })}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {highlightFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2">
                                            <Input
                                                {...form.register(`highlights.${index}.value` as const)}
                                                placeholder={`Feature point ${index + 1}`}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(index)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Brand</Label>
                                    <Input {...form.register("brand")} placeholder="e.g. Lego, Mattel" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        {...form.register("category_id")}
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {form.formState.errors.category_id && <p className="text-sm text-red-500">{form.formState.errors.category_id.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Age Group</Label>
                                <select {...form.register("age_group")} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="">Select Age Group</option>
                                    <option>0-2 Years</option>
                                    <option>3-5 Years</option>
                                    <option>6-9 Years</option>
                                    <option>10-12 Years</option>
                                    <option>13+ Years</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRICING TAB */}
                <TabsContent value="pricing">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                            <CardDescription>Manage prices, stock levels, and SKUs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Regular Price (₹)</Label>
                                    <Input {...form.register("price")} type="number" placeholder="0.00" step="0.01" />
                                    {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Sale Price (₹)</Label>
                                    <Input {...form.register("sale_price")} type="number" placeholder="0.00" step="0.01" />
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>SKU (Stock Keeping Unit)</Label>
                                    <Input {...form.register("sku")} placeholder="e.g. TOY-001" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Barcode / EAN</Label>
                                    <Input {...form.register("barcode")} placeholder="e.g. 123456789" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Stock Quantity</Label>
                                    <Input {...form.register("inventory_count")} type="number" placeholder="0" />
                                    {form.formState.errors.inventory_count && <p className="text-sm text-red-500">{form.formState.errors.inventory_count.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Low Stock Threshold</Label>
                                    <Input {...form.register("low_stock_threshold")} type="number" placeholder="5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SPECS TAB */}
                <TabsContent value="specs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications & Details</CardTitle>
                            <CardDescription>Technical specs, compliance info, and dynamic attributes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Standard Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Standard Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Dimensions</Label>
                                        <Input {...form.register("dimensions")} placeholder="e.g. 10x5x2 cm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight</Label>
                                        <Input {...form.register("weight")} placeholder="e.g. 0.5 kg" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Material</Label>
                                        <Input {...form.register("material")} placeholder="e.g. Plastic, Wood" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Available Colors</Label>
                                        <Input {...form.register("colors")} placeholder="e.g. Red, Blue" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Available Sizes</Label>
                                        <Input {...form.register("sizes")} placeholder="e.g. S, M, L" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Compliance Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Compliance & Warranty</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Country of Origin</Label>
                                        <Input {...form.register("origin")} placeholder="e.g. India" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Manufacturer</Label>
                                        <Input {...form.register("manufacturer")} placeholder="e.g. Nevizon Factory" />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Warranty Description</Label>
                                        <Textarea {...form.register("warranty")} placeholder="e.g. 1 Year Manufacturer Warranty" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Dynamic Specs */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">Technical Specifications</h3>
                                        <p className="text-sm text-muted-foreground">Add custom fields specific to this category (e.g. Movement, Battery Type).</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: "", value: "" })}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Specification
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {specFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <Input
                                                    {...form.register(`specifications.${index}.key` as const)}
                                                    placeholder="Attribute Name (e.g. Movement)"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    {...form.register(`specifications.${index}.value` as const)}
                                                    placeholder="Value (e.g. Quartz)"
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {specFields.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No custom specifications added.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MEDIA TAB */}
                <TabsContent value="media">
                    <Card>
                        <CardHeader>
                            <CardTitle>Media Gallery</CardTitle>
                            <CardDescription>Upload high-quality images for your product.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <CloudinaryUploadWidget onUpload={onUpload} />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {images.map((url, index) => (
                                        <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(url)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    {images.length === 0 && (
                                        <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                                            <p>No images uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SEO TAB */}
                <TabsContent value="seo">
                    <Card>
                        <CardHeader>
                            <CardTitle>Search Engine Optimization</CardTitle>
                            <CardDescription>Optimize your product for search engines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Meta Title</Label>
                                <Input {...form.register("meta_title")} placeholder="e.g. Buy Super Robot - Best Price - Nevizon" />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Description</Label>
                                <Textarea {...form.register("meta_description")} placeholder="Brief description for search results..." />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Slug</Label>
                                <Input {...form.register("slug")} placeholder="e.g. super-robot-action-figure" />
                                <p className="text-xs text-muted-foreground">Leave blank to auto-generate from name.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    )
}
