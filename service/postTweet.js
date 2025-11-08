import { TwitterApi } from "twitter-api-v2";
import sql from "../sql.js";
import { refreshTwitterToken } from "../utils/refreshToken.js";

export const postTweet = async (userId, content) => {
  try {
    let account = await sql("social_accounts")
      .where({
        platform: "twitter",
        user_id: userId,
      })
      .first();

    if (!account) {
      console.error("No Twitter account linked for user ID:", userId);
      throw new Error("No Twitter account linked for this user.");
    }

    if (account.expires_at < 60 * 5) {
      const newAccessToken = await refreshTwitterToken(userId);
      account.access_token = newAccessToken;
    }

    const client = new TwitterApi(account.access_token);

    const tweet = await client.v2.tweet(content);

    return tweet;
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
};
