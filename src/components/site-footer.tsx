import Link from "next/link";
import Image from "next/image";

const socialIcons = ["Instagram", "TikTok", "Threads", "Twitter", "Facebook", "LinkedIn", "YouTube"];

export function SiteFooter() {
  return <footer className="siteFooter">
    <div><Link className="brand brandLogo footerLogo" href="/" aria-label="SPILL home"><Image src="/assets/spill/brand/wordmark-bright.png" alt="SPILL" width={1580} height={250} /></Link><p>Connect. Express. Be seen. Go deeper.</p></div>
    <div className="footerSocials" aria-label="SPILL Saigon social channels — links coming soon">
      {socialIcons.map((social) => <span className="footerSocialIcon" role="img" aria-label={`${social} — link coming soon`} title={`${social} — link coming soon`} key={social}>
        <Image src={`/assets/spill/social/${social.toLowerCase()}.png`} alt="" width={128} height={128} />
      </span>)}
    </div>
    <div className="footerContact"><a href="mailto:hello@spillcafebar.com">hello@spillcafebar.com</a><p>Saigon · Tokyo · The world</p></div>
  </footer>;
}
