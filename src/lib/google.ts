import { google } from "googleapis";

type Tokens = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
};

export async function getGoogleClients(tokens: Tokens) {
  if (!tokens?.accessToken) return null;

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/"
  );

  auth.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken || undefined,
    expiry_date: tokens.expiresAt ? tokens.expiresAt * 1000 : undefined,
  });

  return {
    searchconsole: google.searchconsole({ version: "v1", auth }),
    analyticsdata: google.analyticsdata({ version: "v1beta", auth }),
  };
}
