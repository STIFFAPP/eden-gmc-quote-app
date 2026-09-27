import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eden GMC | Quote workspace",
  description: "Calculate and manage Eden GMC exterior cleaning quotes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
