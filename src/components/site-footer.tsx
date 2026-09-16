import Link from "next/link";
import Image from "next/image";
import { socialLinks } from "@/lib/site-data";

export function SiteFooter() {
  return <footer className="siteFooter">
    <div><Link className="brand brandLogo footerLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/logo-horizontal-bright.webp" alt="SPILL" width={900} height={300} /></Link><p>Connect. Express. Be seen. Go deeper.</p></div>
    <div className="footerSocials" aria-label="SPILL Saigon social media">
      {socialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noreferrer">{social.label}</a>)}
    </div>
    <div className="footerContact"><a href="mailto:hello@spillcafebar.com">hello@spillcafebar.com</a><p>Saigon · Tokyo · The world</p></div>
  </footer>;
}
