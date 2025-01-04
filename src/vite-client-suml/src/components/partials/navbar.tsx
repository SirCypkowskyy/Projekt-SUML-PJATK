import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Navbar({ className }: { className?: string }) {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const { logout: logoutAuth } = useAuth();
    const logout = async () => {
        await logoutAuth().then(() => {
            toast.success("Logged out successfully");
            // przekierowanie po 3 sekundach
            setTimeout(() => {
                navigate({ to: "/" });
            }, 3000);
        });
    }

    return (
        <div className={cn("", className)}>
            {/* AppName */}
            <Link href="/" className="text-2xl font-bold">
                Apocalypse Guide
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
                        <Button onClick={logout}>
                            Logout
                        </Button>
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
                    <>
                        <Link href="/login">
                            Login
                        </Link>
                        <Link href="/register">
                        Register
                    </Link>
                    </>
                )}
            </div>
        </div>
    );
}
