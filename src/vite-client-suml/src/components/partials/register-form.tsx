import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Move schema outside component
const registrationSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  account_creation_token: z.string().min(5),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      account_creation_token: "",
    },
  });

  const onSubmit = (data: RegistrationFormValues) => {
    register(data.email, data.username, data.password, data.account_creation_token).then(
      (successful) => {
        if (successful) {
          toast.success("Rejestracja przebiegła pomyślnie, przekierowanie do strony głównej...");
          setTimeout(() => {
            navigate({ to: "/dashboard" });
          }, 3000);
        } else {
          toast.error("Nie udało się zarejestrować, nieznany błąd");
        }
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
            <h1 className="text-xl font-bold">Witaj w Przewodniku Apokalipsy</h1>
          </div>
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres e-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa użytkownika</FormLabel>
                  <FormControl>
                    <Input placeholder="JohnDoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_creation_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token tworzenia konta</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Zarejestruj się
            </Button>
          </div>
        </form>
      </Form>
      <div className="text-balance text-center text-xs text-muted-foreground">
        Klikając kontynuuj, zgadzasz się na nasze{" "}
        <Dialog>
          <DialogTrigger className="underline underline-offset-4 hover:text-primary">
            Warunki użytkowania
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Warunki użytkowania</DialogTitle>
              <DialogDescription className="text-left">
                <div className="mt-4 space-y-4">
                  <p>1. Akceptacja Warunków</p>
                  <p>Korzystając z Przewodnika Apokalipsy, akceptujesz poniższe warunki...</p>
                  <p>2. Korzystanie z Serwisu</p>
                  <p>Użytkownik zobowiązuje się do...</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>{" "}
        i{" "}
        <Dialog>
          <DialogTrigger className="underline underline-offset-4 hover:text-primary">
            Politykę prywatności
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Polityka Prywatności</DialogTitle>
              <DialogDescription className="text-left">
                <div className="mt-4 space-y-4">
                  <p>1. Gromadzenie Danych</p>
                  <p>Gromadzimy następujące dane osobowe...</p>
                  <p>2. Wykorzystanie Danych</p>
                  <p>Twoje dane są wykorzystywane w celu...</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        .
      </div>
    </div>
  );
}
