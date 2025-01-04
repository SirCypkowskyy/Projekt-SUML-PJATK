import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  };

  return (
    <div className={cn("", className)}>
      {/* AppName */}
      <Link
        href={isAuthenticated ? "/dashboard" : "/"}
        className="text-2xl font-bold px-1"
      >
        Przewodnik Apokalipsy
      </Link>
      <div className="flex items-center justify-between gap-4">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Info</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="pt-2 gap-2">
            <DropdownMenuItem className="w-full py-1">
              <Link href="/about">O nas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="w-full py-1">
              <Link href="/contact">Kontakt</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isAuthenticated ? (
          <>
            <Link href="/profile">Profil</Link>
            {user?.role_id === 1 || user?.role_id === 0 ? (
              <Link href="/admin">Admin</Link>
            ) : null}
            <Button onClick={logout}>Wyloguj się</Button>
          </>
        ) : (
          <>
            <Link href="/login">Zaloguj się</Link>
            <Link href="/register">Zarejestruj się</Link>
          </>
        )}
      </div>
    </div>
  );
}
