'use client'
import { Agency } from '@prisma/client'
import { useForm } from 'react-hook-form'
import React, { useEffect, useState } from 'react'
import { NumberInput } from '@tremor/react'
import { v4 } from 'uuid'

import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useToast } from '../ui/use-toast'

import * as z from 'zod'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { deleteAgency, initUser, saveActivityLogsNotification, updateAgencyDetails, upsertAgency } from '@/lib/queries'
import { Button } from '../ui/button'
import Loading from '../global/loading'

type Props = {
  data?: Partial<Agency>
}

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Jméno Centra musí mít alespoň 2 znaky' }),
  companyEmail: z.string().min(1),
  companyPhone: z.string().min(1),
  whiteLabel: z.boolean(),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  agencyLogo: z.string().min(1),
})

const AgencyDetails = ({ data }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [deletingAgency, setDeletingAgency] = useState(false)
  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name,
      companyEmail: data?.companyEmail,
      companyPhone: data?.companyPhone,
      whiteLabel: data?.whiteLabel || false,
      address: data?.address,
      city: data?.city,
      zipCode: data?.zipCode,
      state: data?.state,
      country: data?.country,
      agencyLogo: data?.agencyLogo,
    },
  })
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [data])

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData
      let custId
      if (!data?.id) {
        const bodyData = {
          email: values.companyEmail,
          name: values.name,
          shipping: {
            address: {
              city: values.city,
              country: values.country,
              line1: values.address,
              postal_code: values.zipCode,
              state: values.zipCode,
            },
            name: values.name,
          },
          address: {
            city: values.city,
            country: values.country,
            line1: values.address,
            postal_code: values.zipCode,
            state: values.zipCode,
          },
        }

        const customerResponse = await fetch('/api/stripe/create-customer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        })
        const customerData: { customerId: string } =
          await customerResponse.json()
        custId = customerData.customerId
      }

      newUserData = await initUser({ role: 'AGENCY_OWNER' })
      if (!data?.customerId && !custId) return

      const response = await upsertAgency({
        id: data?.id ? data.id : v4(),
        customerId: data?.customerId || custId || '',
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: '',
        goal: 5,
      })
      toast({
        title: 'Centrum založeno',
      })
      if (data?.id) return router.refresh()
      if (response) {
        return router.refresh()
      }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Opps!',
        description: 'Cenrum nemohlo být založeno',
      })
    }
  }
  const handleDeleteAgency = async () => {
    if (!data?.id) return
    setDeletingAgency(true)
    //WIP: discontinue the subscription
    try {
      const response = await deleteAgency(data.id)
      toast({
        title: 'Centrum smazáno',
        description: 'Vaše Centrum bylo smazáno a všechny subúčty',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Opps!',
        description: 'Vaše Centrum nemohlo být smazáno',
      })
    }
    setDeletingAgency(false)
  }

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informace o Centru</CardTitle>
          <CardDescription>
            Vytvořme Centrum pro vaše podnikání. Můžete později upravit
            nastavení Centra z karty nastavení Centra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo Centra</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Jméno Centra</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Vaše jméno Centra"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>E-mail Centra</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="E-mail"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Telefonní číslo Centra</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tel. číslo"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>Whitelabel Centra</FormLabel>
                        <FormDescription>
                          Pokud máte vlastní logo a barvu, která by se měla zobrazit
                          na všech subúčtech, můžete zapnout režim whitelabel.
                          Zapnutí režimu whitelabel zobrazí vaše logo Centra
                          ve všech subúčtech jako výchozí. Tuto funkcionalitu
                          můžete přepsat v nastavení subúčtů.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Adresa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ulice 123..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Město</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Město"
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
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Kraj</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Kraj"
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
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>PSČ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="PSČ"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Země</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Země"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {data?.id && (
                <div className="flex flex-col gap-2">
                  <FormLabel>Vytvořte si Cíle</FormLabel>
                  <FormDescription>
                    ✨ Vytvořte si cíle pro Vaše Centrum. Jak Vaše Centrum poroste, Vaše cíle porostou s Vašim centrem
                    Nezapomeňte si nastavit vyšší laťku!
                  </FormDescription>
                  <NumberInput
                    defaultValue={data?.goal}
                    onValueChange={async (val) => {
                      if (!data?.id) return
                      await updateAgencyDetails(data.id, { goal: val })
                      await saveActivityLogsNotification({
                        agencyId: data.id,
                        description: `Aktualizoval/a cíle Centra na| ${val} Subúčet`,
                        subaccountId: undefined,
                      })
                      router.refresh()
                    }}
                    min={1}
                    className="bg-background !border !border-input"
                    placeholder="Cíle Subúčtu"
                  />
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loading /> : 'Uložit informace o Centru'}
              </Button>
            </form>
          </Form>

          {data?.id && (
            <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
              <div>
                <div>Zóna Nebezpečí</div>
              </div>
              <div className="text-muted-foreground">
                Smazání Vašeho Centra nelze vrátit zpět. Tato akce smaže všechny subúčty
                 a veškerá data související s Vaším Centrem.
                Subúčty již nebudou mít přístup k funnelům, kontaktům atd.
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingAgency}
                className="text-red-600 p-2 text-center mt-2 rounded-md hove:bg-red-600 hover:text-white whitespace-nowrap"
              >
                {deletingAgency ? 'Mazání...' : 'Centrum smazáno'}
              </AlertDialogTrigger>
            </div>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Jste si opravdu jisti?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                Tato akce nelze vrátit. Tímto se smaže Centrum a všechny jeho
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center">
              <AlertDialogCancel className="mb-2">Zrušit</AlertDialogCancel>
              <AlertDialogAction
                disabled={deletingAgency}
                className="bg-destructive hover:bg-destructive"
                onClick={handleDeleteAgency}
              >
                Smazat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default AgencyDetails
