import React from 'react'
import { stripe } from '@/lib/stripe'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'

type Props = {
  params: { agencyId: string }
}

const page = async ({ params }: Props) => {
  //CHALLENGE : Create the add on  products, you can also add the icons to the constants file and use them in the pricing card and remove aray of them to control only those which will be shown
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ['data.default_price'],
  })

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })

  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  })

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId
  )

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  })

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: 'Zaplaceno',
      amount: `${charge.amount / 100}CZK`,
    })),
  ]

  return (
    <>
      <SubscriptionHelper
        prices={prices.data}
        customerId={agencySubscription?.customerId || ''}
        planExists={agencySubscription?.Subscription?.active === true}
      />
      <h1 className="text-4xl p-4">Účtování</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Momentální Plán</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices.data}
          customerId={agencySubscription?.customerId || ''}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '0 CZK'
              : '0 CZK'
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true
              ? 'Změnit Plán'
              : 'Začít s Plánem'
          }
          highlightDescription="Chcete si upravit Váš plán? Můžete tak učinit zde. Jestli máte jakékoliv další
          otázky, kontaktujde nathanaelnux@gmail.com"
          highlightTitle="Nabídka Plánů"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Pojďme začít'
              : 'Pojďme začít! Vyberte plán, který pro Vás bude nejlepší.'
          }
          duration="/ měsíčně"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')
                  ?.features ||
                []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
        />
        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={agencySubscription?.Subscription?.active === true}
            prices={prices.data}
            customerId={agencySubscription?.customerId || ''}
            key={addOn.id}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `${addOn.default_price.unit_amount / 100} CZK`
                : '0 CZK'
            }
            buttonCta="Odebírat"
            description=" Dedikovaná podpora a teamový kanál pro podporu"
            duration="/ měsíčně"
            features={[]}
            title={'Prioritní podpora 24/7'}
            highlightTitle="Získejte Podporu Nyní!"
            highlightDescription="Získejte podporu a tím tak přeskočíte dlouhé fronty s jedním kliknutím. "
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Popisek</TableHead>
            <TableHead className="w-[200px]">Id Účtenky</TableHead>
            <TableHead className="w-[300px]">Datum</TableHead>
            <TableHead className="w-[200px]">Zaplaceno</TableHead>
            <TableHead className="text-right">Cena</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">
                {charge.id}
              </TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-emerald-500': charge.status.toLowerCase() === 'zaplaceno',
                    'text-orange-600':
                      charge.status.toLowerCase() === 'nevyřízeno ',
                    'text-red-600': charge.status.toLowerCase() === 'selhalo',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default page
