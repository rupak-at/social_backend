import { TwitterApi } from "twitter-api-v2";
import sql from "../sql.js";

export const refreshTwitterToken = async (userId) => {
  try {
    const account = await sql("social_accounts")
      .where({
        platform: "twitter",
        user_id: userId,
      })
      .first();

    if (!account) throw new Error("No account found with the provided user ID");

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { refreshToken, accessToken, expiresIn } =
      await client.refreshOAuth2Token(account.refresh_token);

    await sql("social_accounts")
      .update({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresIn,
      })
      .where({
        platform: "twitter",
        user_id: userId,
      });
    return accessToken;
  } catch (error) {
    console.error("Error refreshing Twitter token:", error);
    throw error;
  }
};
