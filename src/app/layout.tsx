import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

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
  title: "Telegram Tap Game",
  description: "Touch to earn points - Telegram Mini App",
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
      className={`${googleSans.variable} ${facultyGlyphic.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
