import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export async function getGoogleClients(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
    orderBy: { id: "desc" },
  });

  if (!account?.access_token) return null;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  auth.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token || undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  return {
    searchconsole: google.searchconsole({ version: "v1", auth }),
    analyticsdata: google.analyticsdata({ version: "v1beta", auth }),
  };
}
