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
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
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
