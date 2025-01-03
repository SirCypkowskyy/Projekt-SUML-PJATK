import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth-provider";

export function Navbar({ className }: { className?: string }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className={cn("", className)}>
            {/* AppName */}
            <Link href="/" className="text-2xl font-bold">
                AppName
            </Link>
            <div className="flex items-center justify-between gap-4">
                {!isAuthenticated ? (
                    <Link href="/">
                        Home
                    </Link>
                ) : (
                    <Link href="/dashboard">
                        Dashboard
                    </Link>
                )}
                <Link href="/about">
                    About
                </Link>
                <Link href="/contact">
                    Contact
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link href="/logout">
                            Logout
                        </Link>
                        <Link href="/profile">
                            Profile
                        </Link>
                        {user?.role_id === 1 || user?.role_id === 0 ? (
                            <Link href="/admin">
                                Admin
                            </Link>
                        ) : null}
                    </>
                ) : (
                    <Link href="/login">
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
}
