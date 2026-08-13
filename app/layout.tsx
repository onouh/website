import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { defaultMetadata } from "@/content/seo";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["300", "400", "500"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  ...defaultMetadata,
  metadataBase: new URL(getSiteUrl()),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jetbrains.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col pt-[72px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
