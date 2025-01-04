import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";


export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const RegistrationSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string().min(8),
    account_creation_token: z.string().min(5),
  });

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;    
    const account_creation_token = formData.get(
      "account_creation_token"
    ) as string;

    const safeParse = RegistrationSchema.safeParse({ email, username, password, account_creation_token });

    if(!safeParse.success)
    {
        const validationErrors = "Validation errors: " + safeParse.error.errors.map(error => error.message).join(", ");
        toast.error(validationErrors);
        return;
    }

    const parsedData = safeParse.data;

    register(parsedData.email, parsedData.username, parsedData.password, parsedData.account_creation_token).then((successfull) => {
      if(successfull)
      {
        toast.success("Registration successful, redirecting to dashboard...");
        setTimeout(() => {
          navigate({ to: "/dashboard" });
        }, 3000);
      }
      else
        toast.error("Registration failed, reason unknown");
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleRegister}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Przewodnik Apokalipsy</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Apocalypse Guide</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username"
                type="text" 
                placeholder="JohnDoe" 
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account_creation_token">
                Account Creation Token
              </Label>
              <Input
                id="account_creation_token"
                name="account_creation_token"
                type="text"
                placeholder="1234567890"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
          </div>
        </div>
      </form>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
