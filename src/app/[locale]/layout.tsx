import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
import '../globals.css';

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}