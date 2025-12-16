"use client";

import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const hash = window.location.hash || "";
        const hasAuth =
            hash.includes("access_token=") ||
            hash.includes("error=") ||
            hash.includes("type=");

        if (hasAuth) {
            window.location.replace(`/auth/callback${hash}`);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 text-zinc-900">
            <div className="w-full max-w-md border border-zinc-300 bg-[#fdf4ea] p-5 rounded-xl">
                <div className="text-xs text-zinc-500 font-mono">
                    Simplistic Workout Tracker
                </div>

                <h1 className="mt-3 text-lg font-semibold">
                    Web auth portal
                </h1>

                <p className="mt-2 text-sm text-zinc-600">
                    This website is only used for email confirmations and password resets.
                </p>
            </div>
        </div>
    );
}
