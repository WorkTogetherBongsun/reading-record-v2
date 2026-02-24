import '@/styles/globals.scss';
import { ModalProvider } from '@/components/modal/context/ModalContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  )
}
