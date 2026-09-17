import Image from "next/image";

type Tone = "bright" | "dark";

export function SpillWordmark({ tone = "bright", className = "" }: { tone?: Tone; className?: string }) {
  const dimensions = tone === "bright" ? { width: 1580, height: 250 } : { width: 1580, height: 240 };

  return <span className={`spillWordmark spillWordmark--${tone} ${className}`.trim()}>
    <Image
      src={`/assets/spill/brand/wordmark-${tone}.png`}
      alt="SPILL"
      width={dimensions.width}
      height={dimensions.height}
    />
  </span>;
}

export function BrandedText({ text, tone = "bright" }: { text: string; tone?: Tone }) {
  return <>{text.split(/(\bSPILL\b)/g).map((part, index) => part === "SPILL"
    ? <SpillWordmark key={`${part}-${index}`} tone={tone} />
    : part)}</>;
}
