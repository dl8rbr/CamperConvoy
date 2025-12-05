import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'CamperConvoy - Gemeinsam unterwegs',
  description: 'Plane Konvoi-Fahrten mit anderen Campern, entdecke neue Routen und erlebe unvergessliche Reisen in der Gemeinschaft.',
  keywords: ['Camping', 'Konvoi', 'Wohnmobil', 'Camper', 'Reisen', 'Community'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚐</text></svg>" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-slate-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-3xl">🚐</span>
                      <span className="text-2xl font-bold">CamperConvoy</span>
                    </div>
                    <p className="text-slate-400 max-w-md">
                      Die Plattform für gemeinsame Camping-Abenteuer. 
                      Plane Konvois, finde Reisegruppen und entdecke neue Routen.
                    </p>
                  </div>
                  
                  {/* Links */}
                  <div>
                    <h4 className="font-semibold mb-4">Navigation</h4>
                    <ul className="space-y-2 text-slate-400">
                      <li><a href="/convoys" className="hover:text-teal-400 transition-colors">Konvois</a></li>
                      <li><a href="/map" className="hover:text-teal-400 transition-colors">Karte</a></li>
                      <li><a href="/login" className="hover:text-teal-400 transition-colors">Anmelden</a></li>
                    </ul>
                  </div>
                  
                  {/* Social */}
                  <div>
                    <h4 className="font-semibold mb-4">Community</h4>
                    <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                        📷
                      </a>
                      <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                        📘
                      </a>
                      <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                        🐦
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                  <p>&copy; {new Date().getFullYear()} CamperConvoy. Mit ❤️ für Camper gebaut.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}


