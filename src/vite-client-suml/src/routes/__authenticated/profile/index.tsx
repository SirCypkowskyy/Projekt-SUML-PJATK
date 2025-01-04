import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from '@/providers/theme-provider'
import { useAuth } from '@/providers/auth-provider'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Nazwa użytkownika musi mieć minimum 3 znaki.' })
    .max(50, { message: 'Nazwa użytkownika nie może być dłuższa niż 50 znaków.' }),
  currentPassword: z
    .string()
    .min(3, { message: 'Hasło musi mieć minimum 3 znaki.' })
    .optional()
    .or(z.literal('')),
  newPassword: z
    .string()
    .min(3, { message: 'Nowe hasło musi mieć minimum 3 znaki.' })
    .optional()
    .or(z.literal('')),
  theme: z.enum(['light', 'dark'], {
    required_error: 'Proszę wybrać motyw.',
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const Route = createFileRoute('/__authenticated/profile/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { user, updateUsername, updatePassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      currentPassword: '',
      newPassword: '',
      theme: theme as 'light' | 'dark',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Update username if changed
      if (data.username !== user?.username) {
        const success = await updateUsername(data.username);
        if (!success) {
          throw new Error('Nie udało się zaktualizować nazwy użytkownika');
        }
      }

      // Update password if provided
      if (data.currentPassword && data.newPassword) {
        const success = await updatePassword(
          data.currentPassword,
          data.newPassword,
        );
        if (!success) {
          throw new Error('Nie udało się zaktualizować hasła');
        }
      }

      // Update theme if changed
      if (data.theme !== theme) {
        setTheme(data.theme);
      }

      toast.success('Ustawienia zostały zaktualizowane');
    } catch (error) {
      toast.error('Wystąpił błąd podczas aktualizacji ustawień');
      console.error(error);
    }
  }

  return (
    <div className="container max-w-full p-8">
      <h1 className="text-3xl font-bold mb-8">Ustawienia profilu</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa użytkownika</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  To jest twoja publiczna nazwa użytkownika.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-8">
            <h2 className="text-xl font-semibold">Zmiana hasła</h2>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obecne hasło</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nowe hasło</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motyw</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="light" />
                      </FormControl>
                      <FormLabel className="font-normal">Jasny</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="dark" />
                      </FormControl>
                      <FormLabel className="font-normal">Ciemny</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Zapisz zmiany</Button>
        </form>
      </Form>
    </div>
  )
}

