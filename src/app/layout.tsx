import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DoEasy - Simple Todo App',
  description: 'A simple but intuitive todo app for seamless collaboration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}