import type { Metadata } from "next";
import { Poppins, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import ThemeProvider from "@/providers/ThemeProvider";

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700', '800'], 
  subsets: ["latin"], 
  display: "swap",
  variable: "--font-poppins"
});

const notoSansTamil = Noto_Sans_Tamil({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["tamil"],
  display: "swap",
  variable: "--font-tamil"
});

export const metadata: Metadata = {
  title: "TN Schools AI Smart Learning Ecosystem",
  description:
    "State-wide digital learning, governance, and student success platform for Tamil Nadu Government Schools (Class 6–12).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${poppins.variable} ${notoSansTamil.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

