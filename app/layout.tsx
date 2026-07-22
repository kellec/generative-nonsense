import type { Metadata } from "next";
import { Unica_One } from "next/font/google";
import "./globals.css";

const font = Unica_One({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Procedural Nonsense",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        {children}
      </body>
    </html>
  );
}
