import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OMNI-SIGMA 360 | AI-Powered CRM",
  description: "Next-generation CRM with Global Lead Engine, n8n-style Automation Canvas, and AI-powered Auto-Closer",
  keywords: ["CRM", "AI", "Lead Generation", "Sales Automation", "WhatsApp Marketing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
