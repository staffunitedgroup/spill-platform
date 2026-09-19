"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { investorAccessConfigured, investorAccessToken, investorCookieName, validInvestorPassword } from "@/lib/investor-access";

export async function unlockInvestorOverview(formData: FormData) {
  if (!investorAccessConfigured()) redirect("/partner/investors/overview?error=configuration");
  const password = String(formData.get("password") ?? "");
  if (!validInvestorPassword(password)) redirect("/partner/investors/overview?error=invalid");
  const store = await cookies();
  store.set(investorCookieName, investorAccessToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/partner/investors/overview", maxAge: 60 * 60 * 8 });
  redirect("/partner/investors/overview");
}
