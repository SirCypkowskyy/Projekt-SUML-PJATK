import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleServerError(error: Error) {
  // eslint-disable-next-line no-console
  console.log(error);

  const errMsg = "Coś poszło nie tak!";

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    Number(error.status) === 204
  ) {
    switch (error.status) {
      case 401:
        toast("Sesja wygasła lub użytkownik nie ma dostępu do tej strony!");
        break;
      case 403:
        toast("Brak dostępu do tej strony (nie masz wymaganych uprawnień!)");
        break;
      case 500:
        toast("Wystąpił błąd serwera!");
        break;
    }
  }

  toast(errMsg);
}
