import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Orbitron } from "next/font/google";
import { Anton } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"], // pick the weights you need
});

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Title and description of the page, in the current language.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.className} antialiased`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
