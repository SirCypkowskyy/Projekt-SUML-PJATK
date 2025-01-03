import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);

    return (
        <div className={cn("", className)}>
            {/* AppName */}
            <Link href="/" className="text-2xl font-bold">
                AppName
            </Link>
            <div className="flex items-center justify-between gap-4">
                <Link href="/">
                    Home
                </Link>
                <Link href="/about">
                    About
                </Link>
                <Link href="/contact">
                    Contact
                </Link>
            </div>
        </div>
    );
}
