// Reads YouTube's public channel feed (Atom XML). No dependencies, no API key.

export type ChannelVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  isShort: boolean;
};

function decodeXml(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Parse YouTube's channel Atom feed. */
export function parseChannelFeed(xml: string): ChannelVideo[] {
  const entries = xml.split("<entry>").slice(1);
  return entries
    .map((entry) => {
      const id = entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      const link = entry.match(/<link rel="alternate" href="([^"]+)"/)?.[1] ?? "";
      if (!id || !title || !publishedAt) return null;
      return {
        id,
        title: decodeXml(title).trim(),
        publishedAt,
        // hqdefault always exists; the feed's own thumbnail URL varies by host.
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        isShort: link.includes("/shorts/"),
      };
    })
    .filter((video): video is ChannelVideo => video !== null);
}

