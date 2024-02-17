'use client'
import { deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import React from 'react'

type Props = {
  subaccountId: string
}

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter()

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubaccountDetails(subaccountId)
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Smazal/a subúčet | ${response?.name}`,
          subaccountId,
        })
        await deleteSubAccount(subaccountId)
        router.refresh()
      }}
    >
      Smazat subúčet
    </div>
  )
}

export default DeleteButton
