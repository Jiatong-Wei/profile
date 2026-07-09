import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s | ${SITE.shortName}`
  },
  description: SITE.description,
  icons: {
    icon: [
      { url: `${SITE.basePath}/icons/icon.png`, type: "image/png" }
    ],
    shortcut: `${SITE.basePath}/icons/icon.png`,
    apple: `${SITE.basePath}/icons/icon.png`
  },
  metadataBase: new URL("https://jiatong-wei.github.io/profile/")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
