import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { RailwayUserProvider } from "~/context/railway-user-context";

export const metadata: Metadata = {
  title: "Railway Client",
  description: "Basic client app for managing Railway.app containers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <RailwayUserProvider>{children}</RailwayUserProvider>
      </body>
    </html>
  );
}
