"use client";

import {useEffect, useMemo, useState} from "react";

type State =
    | { status: "loading"; message: string }
    | { status: "success"; message: string }
    | { status: "error"; message: string };

function parseAuthParams() {
    if (typeof window === "undefined") return null;

    const hashRaw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";

    const hashParams = new URLSearchParams(hashRaw);
    const searchParams = new URLSearchParams(window.location.search);

    return {
        type: hashParams.get("type") ?? searchParams.get("type"),
        accessToken: hashParams.get("access_token"),
        refreshToken: hashParams.get("refresh_token"),
        message: hashParams.get("message") ?? searchParams.get("message"),
        error:
            hashParams.get("error") ??
            searchParams.get("error"),
        errorDescription:
            hashParams.get("error_description") ??
            searchParams.get("error_description"),
    };
}

export default function CallbackClient() {
    const [state, setState] = useState<State>({
        status: "loading",
        message: "Processing…",
    });

    const info = useMemo(() => parseAuthParams(), []);

    useEffect(() => {
        if (!info) return;

        const next: State = (() => {
            if (info.error || info.errorDescription) {
                return {
                    status: "error",
                    message: info.errorDescription ?? info.error ?? "Something went wrong.",
                };
            }

            if (info.message) {
                return {
                    status: "success",
                    message: decodeURIComponent(info.message.replace(/\+/g, " ")),
                };
            }

            const kind =
                info.type === "signup"
                    ? "Your email has been confirmed. You can now sign in."
                    : info.type === "recovery"
                        ? "You can now reset your password."
                        : info.type === "email_change"
                            ? "Your email address has been updated."
                            : "This action has been completed.";

            return {status: "success", message: kind};
        })();

        queueMicrotask(() => setState(next));
    }, [info]);


    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md border bg-[var(--card)] border-[var(--border)] p-5">
                <div className="text-xs text-[var(--muted)] font-mono">
                    Simplistic Workout Tracker
                </div>

                <h1 className="mt-3 text-lg font-semibold">
                    {state.status === "loading"
                        ? "One moment"
                        : state.status === "success"
                            ? "All set"
                            : "Couldn’t complete"}
                </h1>

                <p className="mt-2 text-sm text-[var(--muted)]">
                    {state.message}
                </p>

                <p className="mt-4 text-xs text-[var(--subtle)] font-mono">
                    If nothing happens, the link may have expired.
                </p>
            </div>
        </div>
    );
}
