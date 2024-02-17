'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'
import { ContactUserFormSchema } from '@/lib/types'
import { saveActivityLogsNotification, upsertContact } from '@/lib/queries'
import { toast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useModal } from '@/providers/modal-provider'

interface ContactUserFormProps {
  subaccountId: string
}

const ContactUserForm: React.FC<ContactUserFormProps> = ({ subaccountId }) => {
  const { setClose, data } = useModal()
  const router = useRouter()
  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  useEffect(() => {
    if (data.contact) {
      form.reset(data.contact)
    }
  }, [data, form.reset])

  const isLoading = form.formState.isLoading

  const handleSubmit = async (
    values: z.infer<typeof ContactUserFormSchema>
  ) => {
    try {
      const response = await upsertContact({
        email: values.email,
        subAccountId: subaccountId,
        name: values.name,
      })
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Aktualizoval/a Kontakt | ${response?.name}`,
        subaccountId: subaccountId,
      })
      toast({
        title: 'Úspěch',
        description: 'Informace o Kontaktu byly uloženy',
      })
      setClose()
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Opps!',
        description: 'Informace o Kontaktu nemohly být uloženy',
      })
    }
  }

  return (
    <Card className=" w-full">
      <CardHeader>
        <CardTitle>Kontakt Info</CardTitle>
        <CardDescription>
          Ke kontaktu můžete připnout Lístky a nastavit hodnotu pro každý kontakt v lístku.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jméno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jméno"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="E-mail"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? (
                <Loading />
              ) : (
                'Informace o Kontaktu uloženy!'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ContactUserForm
