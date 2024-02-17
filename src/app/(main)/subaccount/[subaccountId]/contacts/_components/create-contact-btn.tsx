'use client'
import ContactUserForm from '@/components/forms/contact-user-form'
import CustomModal from '@/components/global/custom-modal'
import { Button } from '@/components/ui/button'
import { useModal } from '@/providers/modal-provider'
import React from 'react'

type Props = {
  subaccountId: string
}

const CraeteContactButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal()

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Vytvořte nebo Aktualizujte informace o kontaktu."
        subheading="Kontakty jsou Vaši Zákazníci."
      >
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>
    )
  }

  return <Button onClick={handleCreateContact}>Vytvořit Kontakt</Button>
}

export default CraeteContactButton
