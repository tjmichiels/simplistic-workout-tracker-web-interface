export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md border bg-[var(--card)] border-[var(--border)] p-5">
                <div className="text-xs text-[var(--muted)] font-mono">
                    Simplistic Workout Tracker
                </div>

                <h1 className="mt-3 text-lg font-semibold">
                    Web auth portal
                </h1>

                <p className="mt-2 text-sm text-[var(--muted)]">
                    This website is only used for email confirmations and password resets.
                </p>
            </div>
        </div>
    );
}
