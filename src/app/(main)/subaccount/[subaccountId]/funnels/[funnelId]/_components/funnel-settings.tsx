import React from 'react'

import { Funnel, SubAccount } from '@prisma/client'
import { db } from '@/lib/db'
import { getConnectAccountProducts } from '@/lib/stripe/stripe-actions'


import FunnelForm from '@/components/forms/funnel-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import FunnelProductsTable from './funnel-products-table'

interface FunnelSettingsProps {
  subaccountId: string
  defaultData: Funnel
}

const FunnelSettings: React.FC<FunnelSettingsProps> = async ({
  subaccountId,
  defaultData,
}) => {
  //CHALLENGE: go connect your stripe to sell products
  //When they try to access the products if the account is not canceled we should not show the funnel page
  //We should show a message to connect the stripe account, If they do not have it connected, otherwise dont show the funnel page
  //Same thing is in the dashboard, if they do not have the stripe account connected, we should show a message to connect the stripe account

  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  })

  if (!subaccountDetails) return
  if (!subaccountDetails.connectAccountId) return
  const products = await getConnectAccountProducts(
    subaccountDetails.connectAccountId
  )

  return (
    <div className="flex gap-4 flex-col xl:!flex-row">
      <Card className="flex-1 flex-shrink">
        <CardHeader>
          <CardTitle>Funnel Produkty</CardTitle>
          <CardDescription>
            Vyberte produkty a služby, které chcete prodat na tomto funnelu.
            Můžete prodávat jednorázové a pravidelné produkty.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <>
            {subaccountDetails.connectAccountId ? (
              <FunnelProductsTable
                defaultData={defaultData}
                products={products}
              />
            ) : (
              'Připojte si svůj účet Stripe, abyste mohli prodávat produkty.'
            )}
          </>
        </CardContent>
      </Card>

      <FunnelForm
        subAccountId={subaccountId}
        defaultData={defaultData}
      />
    </div>
  )
}

export default FunnelSettings
