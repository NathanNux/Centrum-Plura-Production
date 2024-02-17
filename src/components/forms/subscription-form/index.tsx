'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'

type Props = {
  selectedPriceId: string | Plan
}

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const { toast } = useToast()
  const elements = useElements()
  const stripeHook = useStripe()
  const [priceError, setPriceError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPriceId) {
      setPriceError('Musíte mít vybraný plán, abyste se mohli přihlásit.')
      return
    }
    setPriceError('')
    event.preventDefault()
    if (!stripeHook || !elements) return

    try {
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      })
      if (error) {
        throw new Error()
      }
      toast({
        title: 'Platba proběhla úspěšně',
        description: 'Vaše platba byla úspěšně zpracována.',
      })
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Platba selhala',
        description:
          'Nemohli jsme zpracovat Vaši platbu, zkuste prosím jinou platební kartu',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <PaymentElement />
      <Button
        disabled={!stripeHook}
        className="mt-4 w-full"
      >
        Potvrdit
      </Button>
    </form>
  )
}
export default SubscriptionForm
