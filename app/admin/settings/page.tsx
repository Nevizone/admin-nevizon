"use client"

import AdminSettings from "@/components/admin-settings"

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <AdminSettings />
        </div>
    )
}
