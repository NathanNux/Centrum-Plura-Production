import Link from 'next/link'
import React from 'react'

type Props = {}

const Unauthorized = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen w-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">Neoprávněný Přístup!</h1>
      <p> Prosím kontaktujte Podporu nebo Vlastníka Centra pro povolení k přístupu</p>
      <Link
        href="/"
        className="mt-4 bg-primary p-2"
      >
        Zpět Domů
      </Link>
    </div>
  )
}

export default Unauthorized
