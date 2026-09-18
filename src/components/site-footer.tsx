import Link from "next/link";
import Image from "next/image";
import { socialLinks } from "@/lib/site-data";

const socialIconNames: Record<string, string> = { X: "twitter" };

export function SiteFooter() {
  return <footer className="siteFooter">
    <div className="footerIdentity"><Link className="brand brandLogo footerLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link><p>Good people. Brighter conversations.</p></div>
    <nav className="footerLinks" aria-label="Corporate links">
      <Link href="/about">About</Link><Link href="/careers">Careers</Link><Link href="/press">Press</Link><Link href="/contact">Contact</Link>
      <Link href="/partner/investors">Investors</Link><Link href="/partner">Partner With SPILL</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link>
    </nav>
    <div className="footerSocials" aria-label="SPILL Saigon social channels">
      {socialLinks.map((social) => <a className="footerSocialIcon" href={social.href} target="_blank" rel="noreferrer" aria-label={`Follow SPILL Saigon on ${social.label}`} title={social.label} key={social.label}>
        <Image src={`/assets/spill/social/${socialIconNames[social.label] ?? social.label.toLowerCase()}.png`} alt="" width={128} height={128} />
      </a>)}
    </div>
    <div className="footerContact"><a href="mailto:hello@spillcafebar.com">hello@spillcafebar.com</a><p>Saigon · Hanoi · Tokyo · The world</p></div>
  </footer>;
}
