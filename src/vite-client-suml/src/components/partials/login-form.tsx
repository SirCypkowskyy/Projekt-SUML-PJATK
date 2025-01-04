import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/providers/auth-provider";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    login(username, password).then((successfull) => {
      // sprawdzenie, czy jest authenticated po 0,5 sekundy
      if (successfull)
      {
        toast.success("Zalogowano pomyślnie");
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 500);
      }
      else
        toast.error("Nie udało się zalogować, nieznany błąd");
    });
  };

  return (
    <form onSubmit={handleLogin} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Zaloguj się do swojego konta</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Wpisz swoją nazwę użytkownika poniżej, aby zalogować się do swojego konta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username">Nazwa użytkownika</Label>
          <Input name="username" id="username" type="text" placeholder="username" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Hasło</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Zapomniałeś hasła?
            </a>
          </div>
          <Input name="password" id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj się
        </Button>
      </div>
      <div className="text-center text-sm">
        Nie masz jeszcze konta?{" "}
        <Link to="/register" className="underline underline-offset-4 hover:no-underline">
          Zarejestruj się
        </Link>
      </div>
    </form>
  )
}
