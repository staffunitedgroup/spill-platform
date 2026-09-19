import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { investorCookieName, validInvestorAccessToken } from "@/lib/investor-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  if (!validInvestorAccessToken(store.get(investorCookieName)?.value)) return new Response("Investor access required", { status: 401 });
  const document = await readFile(path.join(process.cwd(), "src/private/investor-overview.pdf"));
  return new Response(document, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=SPILL-Investor-Overview.pdf",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
