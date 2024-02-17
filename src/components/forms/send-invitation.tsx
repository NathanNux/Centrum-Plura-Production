'use client'
import React from 'react'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { saveActivityLogsNotification, sendInvitation } from '@/lib/queries'
import { useToast } from '../ui/use-toast'

interface SendInvitationProps {
  agencyId: string
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { toast } = useToast()
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(['AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  })

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      role: 'SUBACCOUNT_USER',
    },
  })

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation(values.role, values.email, agencyId)
      await saveActivityLogsNotification({
        agencyId: agencyId,
        description: `${res.email} byl Pozván`,
        subaccountId: undefined,
      })
      toast({
        title: 'Úspěch',
        description: 'Pozvánka byla úspěšně vytvořena a odeslána',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Opps!',
        description: 'Pozvánka nemohla být vytvořena',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pozvánky</CardTitle>
        <CardDescription>
          Pozvěte uživatele do Vašeho Centra. Uživatel obdrží pozvánku na
          email. Uživatelé, kteří již mají pozvánku odeslanou na jejich email,
          neobdrží další pozvánku.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E-mail"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Role uživatele</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte roli..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Admin Centra</SelectItem>
                      <SelectItem value="SUBACCOUNT_USER">
                        Uživatel Subúčtu
                      </SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">
                        Host Subúčtu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              {form.formState.isSubmitting ? <Loading /> : 'Poslat Pozvánku'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default SendInvitation
