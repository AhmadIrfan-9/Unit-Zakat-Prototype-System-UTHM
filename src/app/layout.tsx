import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Determine the correct app URL based on environment
const getAppUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NODE_ENV === "production") {
    return "https://sistem-caruman-zakat-gaji-uthm.vercel.app";
  }
  
  return "http://localhost:3000";
};

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: {
    default: "Log Masuk Portal Caruman Zakat Gaji UTHM | Pusat Islam UTHM",
    template: "%s | Sistem Caruman Zakat Gaji UTHM"
  },
  description: "Portal rasmi kakitangan UTHM untuk urusan permohonan, potongan, dan pengurusan caruman zakat pendapatan secara bulanan melalui Unit Kutipan Zakat, Pusat Islam UTHM.",
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Log Masuk Portal Caruman Zakat Gaji UTHM | Pusat Islam UTHM",
    description: "Uruskan permohonan potongan zakat pendapatan bulanan anda secara digital dengan selamat melalui Unit Kutipan Zakat UTHM.",
    url: `${appUrl}/login`,
    siteName: "Sistem Zakat UTHM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sistem Caruman Zakat Gaji UTHM",
      },
    ],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistem Caruman Zakat Gaji UTHM | Pusat Islam UTHM",
    description: "Portal rasmi kakitangan UTHM untuk urusan permohonan dan potongan zakat pendapatan secara bulanan.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
