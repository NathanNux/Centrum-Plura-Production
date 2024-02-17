'use client'
import React from 'react'
import { z } from 'zod'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { createMedia, saveActivityLogsNotification } from '@/lib/queries'
import { Input } from '../ui/input'
import FileUpload from '../global/file-upload'
import { Button } from '../ui/button'

type Props = {
  subaccountId: string
}

const formSchema = z.object({
  link: z.string().min(1, { message: 'Jméno Média souboru je povinné' }),
  name: z.string().min(1, { message: 'Jméno je povinné' }),
})

const UploadMediaForm = ({ subaccountId }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      link: '',
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createMedia(subaccountId, values)
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Nahrál/a Média soubor | ${response.name}`,
        subaccountId,
      })

      toast({ title: 'Úspěch', description: 'Média Soubor nahrán' })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Média Soubor nemohl být nahrán',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informace o Média Souboru</CardTitle>
        <CardDescription>
          Prosím vyplňte detaily o souboru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Jméno souboru</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Jméno Vašeho souboru"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Média Soubor</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subaccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mt-4"
            >
              Nahrát Soubor
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UploadMediaForm
