"use client";

import {useEffect, useMemo, useState} from "react";
import {supabase} from "@/lib/supabase";

type State =
    | { status: "loading"; title: string; message: string }
    | { status: "success"; title: string; message: string }
    | { status: "pending"; title: string; message: string }
    | { status: "error"; title: string; message: string };

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
        error: hashParams.get("error") ?? searchParams.get("error"),
        errorDescription:
            hashParams.get("error_description") ?? searchParams.get("error_description"),
    };
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
        return JSON.stringify(err);
    } catch {
        return "Something went wrong.";
    }
}

function Card({children}: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md border bg-[var(--card)] border-[var(--border)] p-5">
                {children}
            </div>
        </div>
    );
}

function ResetPasswordForm(props: { accessToken: string; refreshToken: string }) {
    const {accessToken, refreshToken} = props;

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const {error} = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (!cancelled && error) setError(error.message);
        })();

        return () => {
            cancelled = true;
        };
    }, [accessToken, refreshToken]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmed = password.trim();

        if (!trimmed) {
            setError("Password is required.");
            return;
        }
        if (trimmed.length < 8) {
            setError("Use at least 8 characters.");
            return;
        }
        if (trimmed !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setSaving(true);

            const {error} = await supabase.auth.updateUser({password: trimmed});
            if (error) throw error;

            await supabase.auth.signOut();
            setDone(true);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (done) {
        return (
            <Card>
                <div className="text-xs text-[var(--muted)] font-mono">
                    Simplistic Workout Tracker
                </div>
                <h1 className="mt-3 text-lg font-semibold">Password updated</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">
                    Your password has been changed. You can now sign in in the app.
                </p>
            </Card>
        );
    }

    return (
        <Card>
            <div className="text-xs text-[var(--muted)] font-mono">
                Simplistic Workout Tracker
            </div>

            <h1 className="mt-3 text-lg font-semibold">Set a new password</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
                Choose a new password for your account.
            </p>

            <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
                <label className="grid gap-1 text-sm">
                    <span className="text-[var(--muted)]">New password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-[var(--border)] bg-transparent p-2 outline-none"
                        autoComplete="new-password"
                    />
                </label>

                <label className="grid gap-1 text-sm">
                    <span className="text-[var(--muted)]">Confirm password</span>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="border border-[var(--border)] bg-transparent p-2 outline-none"
                        autoComplete="new-password"
                    />
                </label>

                {error && (
                    <div className="text-sm" style={{color: "var(--danger)"}}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="mt-1 border border-[var(--border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Update password"}
                </button>

                <p className="mt-2 text-xs text-[var(--subtle)] font-mono">
                    If this link expired, request a new reset email from the app.
                </p>
            </form>
        </Card>
    );
}

export default function CallbackClient() {
    const [state, setState] = useState<State>({
        status: "loading",
        title: "One moment",
        message: "Processing…",
    });

    const info = useMemo(() => parseAuthParams(), []);

    const showResetForm =
        info?.type === "recovery" &&
        typeof info.accessToken === "string" &&
        info.accessToken.length > 0 &&
        typeof info.refreshToken === "string" &&
        info.refreshToken.length > 0;

    // Hooks blijven altijd in dezelfde volgorde aangeroepen
    useEffect(() => {
        if (!info) return;
        if (showResetForm) return; // reset-form handelt zichzelf af

        const next: State = (() => {
            if (info.error || info.errorDescription) {
                return {
                    status: "error",
                    title: "Couldn’t complete",
                    message: info.errorDescription ?? info.error ?? "Something went wrong.",
                };
            }

            if (info.message) {
                const decoded = decodeURIComponent(info.message.replace(/\+/g, " "));

                if (decoded.toLowerCase().includes("confirm link sent to the other email")) {
                    return {
                        status: "pending",
                        title: "Check your email",
                        message:
                            "Your request was accepted. Please open the confirmation link that was sent to your new email address.",
                    };
                }

                return {status: "success", title: "All set", message: decoded};
            }

            const kind =
                info.type === "signup"
                    ? {title: "Email confirmed", message: "You can now sign in."}
                    : info.type === "email_change"
                        ? {title: "Email updated", message: "Your email address has been updated."}
                        : {title: "Completed", message: "This action has been completed."};

            return {status: "success", ...kind};
        })();

        queueMicrotask(() => setState(next));
    }, [info, showResetForm]);

    if (showResetForm && info) {
        return (
            <ResetPasswordForm
                accessToken={info.accessToken as string}
                refreshToken={info.refreshToken as string}
            />
        );
    }

    return (
        <Card>
            <div className="text-xs text-[var(--muted)] font-mono">
                Simplistic Workout Tracker
            </div>

            <h1 className="mt-3 text-lg font-semibold">{state.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{state.message}</p>

            <p className="mt-4 text-xs text-[var(--subtle)] font-mono">
                If nothing happens, the link may have expired.
            </p>
        </Card>
    );
}
