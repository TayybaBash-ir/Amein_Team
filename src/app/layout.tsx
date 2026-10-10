import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import MobileAppFrame from "@/components/clima/MobileAppFrame";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ClimaDiet - AI Calorie Counter & Diet Plans",
  description: "Track calories and get personalized meal plans with AI and a verified food database.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}
      >
        <Suspense fallback={children}>
          <MobileAppFrame>{children}</MobileAppFrame>
        </Suspense>
      </body>
    </html>
  );
}

