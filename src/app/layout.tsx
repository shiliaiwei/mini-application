import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "@telegram-apps/telegram-ui/dist/styles.css";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const googleSans = localFont({
  src: [
    {
      path: "../../public/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/GoogleSans-Italic-VariableFont_GRAD,opsz,wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
});

const facultyGlyphic = localFont({
  src: "../../public/fonts/FacultyGlyphic-Regular.ttf",
  variable: "--font-faculty-glyphic",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SHILIAIWEI - Telegram Web3 Vault & Gaming",
  description: "Official SHILIAIWEI Telegram Web3 Mini App",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "X-Content-Type-Options": "nosniff",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${googleSans.variable} ${facultyGlyphic.variable} h-full antialiased light`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-[#0f172a] antialiased font-sans selection:bg-[#0098ea] selection:text-white">
        {children}
      </body>
    </html>

  );
}
