import BlurPage from '@/components/global/blur-page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { db } from '@/lib/db'
import { Contact, SubAccount, Ticket } from '@prisma/client'
import format from 'date-fns/format'
import React from 'react'
import CraeteContactButton from './_components/create-contact-btn'

type Props = {
  params: { subaccountId: string }
}

const ContactPage = async ({ params }: Props) => {
  type SubAccountWithContacts = SubAccount & {
    Contact: (Contact & { Ticket: Ticket[] })[]
  }

  const contacts = (await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },

    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })) as SubAccountWithContacts

  const allContacts = contacts.Contact

  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return '0.00 CZK'
    const amt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'CZK',
    })

    const laneAmt = tickets.reduce(
      (sum, ticket) => sum + (Number(ticket?.value) || 0),
      0
    )

    return amt.format(laneAmt)
  }
  return (
    <BlurPage>
      <h1 className="text-4xl p-4">Kontakty</h1>
      <CraeteContactButton subaccountId={params.subaccountId} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Jméno</TableHead>
            <TableHead className="w-[300px]">E-mail</TableHead>
            <TableHead className="w-[200px]">Aktivní od</TableHead>
            <TableHead>Datum Založení</TableHead>
            <TableHead className="text-right">Celková Cena</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="@shadcn" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '0.00 CZK' ? (
                  <Badge variant={'destructive'}>neaktivní</Badge>
                ) : (
                  <Badge className="bg-emerald-700">aktivní</Badge>
                )}
              </TableCell>
              <TableCell>{format(contact.createdAt, 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">
                {formatTotal(contact.Ticket)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BlurPage>
  )
}

export default ContactPage
