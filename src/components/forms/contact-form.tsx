import { ContactUserFormSchema } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Loading from '../global/loading'

type Props = {
  title: string
  subTitle: string
  apiCall: (values: z.infer<typeof ContactUserFormSchema>) => any
}

const ContactForm = ({ apiCall, subTitle, title }: Props) => {
  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })
  const isLoading = form.formState.isLoading

    //CHALLENGE: We want to create tags for each leads that comes from the form
    // This will give tags to subaccounts, these tags are different than the other, these are for attaching them to the contacts that are coming from the form
    // this tag will basically show from which form the contact came from and will be used for the automation
    // create a tags that will map from where the lead is comming from
  
  return (
    <Card className="max-w-[500px] w-[500px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subTitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(apiCall)}
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
              {form.formState.isSubmitting ? <Loading /> : 'Získejte cenovou nabídku zdarma!'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ContactForm
