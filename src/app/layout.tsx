import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Provider } from "@/components/ui/provider";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PicShare Booth",
  description: "A playful event photo booth for quick QR and email sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={onest.variable}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
