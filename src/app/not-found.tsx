// src/app/not-found.tsx
export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 text-zinc-900">
            <div className="w-full max-w-md border border-zinc-300 bg-[#fdf4ea] p-5 rounded-xl">
                <div className="text-xs text-zinc-500 font-mono">
                    Simplistic Workout Tracker
                </div>

                <h1 className="mt-3 text-lg font-semibold">
                    Page not found
                </h1>

                <p className="mt-2 text-sm text-zinc-600">
                    The page you’re looking for doesn’t exist or has been moved.
                </p>
            </div>
        </div>
    );
}
