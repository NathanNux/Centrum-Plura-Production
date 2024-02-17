'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/input'

import { Button } from '../ui/button'
import Loading from '../global/loading'
import { useToast } from '../ui/use-toast'
import { FunnelPage } from '@prisma/client'
import { FunnelPageSchema } from '@/lib/types'
import { deleteFunnelePage, getFunnels, saveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { v4 } from 'uuid'
import { CopyPlusIcon, Trash } from 'lucide-react'

interface CreateFunnelPageProps {
  defaultData?: FunnelPage
  funnelId: string
  order: number
  subaccountId: string
}

const CreateFunnelPage: React.FC<CreateFunnelPageProps> = ({
  defaultData,
  funnelId,
  order,
  subaccountId,
}) => {
  const { toast } = useToast()
  const router = useRouter()
  //ch
  const form = useForm<z.infer<typeof FunnelPageSchema>>({
    resolver: zodResolver(FunnelPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName })
    }
  }, [defaultData])

  const onSubmit = async (values: z.infer<typeof FunnelPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError('pathName', {
        message:
          "Všechny stránky kromě Vaší první vyžaduní zadání jejich cesty, například 'produkt2'.",
      })
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || '',
        },
        funnelId
      )

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Aktulizoval/a Funnel Stránku | ${response?.name}`,
        subaccountId: subaccountId,
      })

      toast({
        title: 'Úspěch',
        description: 'Informace o Stránce byly uloženy',
      })
      router.refresh()
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Opps!',
        description: 'Informace o Stránce nemohly být uloženy',
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stránka Funnelu</CardTitle>
        <CardDescription>
          Uspořádání Stránke Funnelu je výchozí. Můžete je přesunout, aby byly
          v jiném pořadí.
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
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
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
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Jméno Cesty</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cesta pro Vaši stránku"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? <Loading /> : 'Uložit Stránku'}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive"
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await deleteFunnelePage(defaultData.id)
                    await saveActivityLogsNotification({
                      agencyId: undefined,
                      description: `Smazal/a Stránky Funnelu | ${response?.name}`,
                      subaccountId: subaccountId,
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <Trash />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={form.formState.isSubmitting}
                  type="button"
                  onClick={async () => {
                    const response = await getFunnels(subaccountId)
                    const lastFunnelPage = response.find(
                      (funnel) => funnel.id === funnelId
                    )?.FunnelPages.length

                    await upsertFunnelPage(
                      subaccountId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastFunnelPage ? lastFunnelPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      funnelId
                    )
                    toast({
                      title: 'Úspěch',
                      description: 'Informace o stránce byly uloženy',
                    })
                    router.refresh()
                  }}
                >
                  {form.formState.isSubmitting ? <Loading /> : <CopyPlusIcon />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CreateFunnelPage
