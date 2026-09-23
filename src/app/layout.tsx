import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SectionNavigator } from "@/components/section-navigator";
import { FloatingContact } from "@/components/floating-contact";
import { PageTransition } from "@/components/page-transition";
import { cookies } from "next/headers";
import { SITE_ACCESS_COOKIE, hasValidSiteAccess } from "@/lib/site-access";
import { SiteLockscreen } from "@/components/site-lockscreen";
import "lenis/dist/lenis.css";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: { default: "SPILL — Café Bar, Social Experience & Media Platform", template: "%s | SPILL" },
  description: "A new kind of social venue. Coffee, cocktails, conversation, livestreams, podcasts, and original media—built to bring people together.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://spill-cafe-bar.masx-world-7829.chatgpt.site"),
  icons: { icon: "/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const authorized = hasValidSiteAccess(cookieStore.get(SITE_ACCESS_COOKIE)?.value);

  return (
    <html lang="en">
      <body className={spaceGrotesk.variable}>
        {authorized ? (
          <>
            <SmoothScroll>
              <PageTransition>{children}</PageTransition>
              <SiteFooter />
            </SmoothScroll>
            <SectionNavigator />
            <FloatingContact phone={process.env.NEXT_PUBLIC_CONTACT_PHONE} />
          </>
        ) : (
          <SiteLockscreen />
        )}
      </body>
    </html>
  );
}
