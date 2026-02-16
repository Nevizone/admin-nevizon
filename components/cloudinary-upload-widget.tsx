import { Button } from "@/components/ui/button"
import { ImagePlus, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { useStoreSettings } from "@/hooks/use-store-settings"
import { useToast } from "@/hooks/use-toast"

declare global {
    interface Window {
        cloudinary: any
    }
}

interface CloudinaryUploadWidgetProps {
    onUpload: (result: any) => void
    buttonText?: string
    children?: React.ReactNode
}

export default function CloudinaryUploadWidget({ onUpload, buttonText = "Upload Image", children }: CloudinaryUploadWidgetProps) {
    const cloudinaryRef = useRef<any>(null)
    const widgetRef = useRef<any>(null)
    const { settings, loading } = useStoreSettings()
    const { toast } = useToast()

    useEffect(() => {
        if (!settings || !window.cloudinary) return

        const cloudName = settings.cloudinary_cloud_name
        const uploadPreset = settings.cloudinary_upload_preset

        if (!cloudName || !uploadPreset) return

        cloudinaryRef.current = window.cloudinary
        widgetRef.current = cloudinaryRef.current.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                multiple: true,
                maxFiles: 10,
                sources: ["local", "url", "camera"],
            },
            (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    console.log("Upload success:", result.info)
                    onUpload(result.info)
                } else if (error) {
                    console.error("Cloudinary Error:", error)
                }
            }
        )
    }, [settings, onUpload])

    const openWidget = () => {
        if (loading) return

        if (!settings?.cloudinary_cloud_name || !settings?.cloudinary_upload_preset) {
            toast({
                title: "Configuration Missing",
                description: "Please configure Cloudinary settings in Admin > Settings > Media.",
                variant: "destructive"
            })
            return
        }

        if (widgetRef.current) {
            widgetRef.current.open()
        } else {
            toast({
                title: "Widget Not Ready",
                description: "Cloudinary widget is still initializing. Please try again.",
                variant: "destructive"
            })
        }
    }

    if (loading) {
        return <Button variant="outline" disabled><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</Button>
    }

    if (children) {
        return (
            <div onClick={openWidget} className="cursor-pointer">
                {children}
            </div>
        )
    }

    return (
        <Button type="button" variant="outline" onClick={openWidget} className="gap-2">
            <ImagePlus className="w-4 h-4" />
            {buttonText}
        </Button>
    )
}
