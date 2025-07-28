import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export const verifyGoogleToken = async (
  token: string,
): Promise<GoogleUserInfo | null> => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Google Client ID not configured");
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    return {
      id: payload.sub,
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture,
      email_verified: payload.email_verified || false,
    };
  } catch (error) {
    console.error("Google token verification failed:", error);
    return null;
  }
};

export const generateGoogleAuthUrl = (redirectUri: string): string => {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const authUrl =
    `https://accounts.google.com/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes.join(" "))}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`;

  return authUrl;
};
