import { TwitterApi } from "twitter-api-v2";
import sql from "../sql.js";
import { postTweet } from "../service/postTweet.js";

const twitterLogin = async (req, res) => {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      process.env.TWITTER_CALLBACK_URL,
      { scope: ["tweet.read", "users.read", "offline.access", "tweet.write"] }
    );

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;
    req.session.userId = req.user.id;

    return res.redirect(url);
  } catch (error) {
    console.error("Twitter login failed:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const twitterCallBack = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (
      !state ||
      !req?.session?.state ||
      state !== req?.session?.state ||
      !req?.session?.userId
    ) {
      return res.status(400).send("Invalid state");
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
      ...rest
    } = await client.loginWithOAuth2({
      code,
      codeVerifier: req?.session?.codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL,
    });

    const hasAlreadyLinked = await sql("social_accounts").where({
      user_id: req?.session?.userId,
      platform: "twitter",
    });

    if (hasAlreadyLinked.length === 0) {
      await sql("social_accounts").insert({
        user_id: req?.session?.userId,
        platform: "twitter",
        platform_user_id: (await loggedClient.currentUserV2())?.data?.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresIn,
        account_username: (await loggedClient.currentUserV2())?.data?.username,
      });
    } else {
      await sql("social_accounts")
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresIn,
          account_username: (
            await loggedClient.currentUserV2()
          )?.data?.username,
        })
        .where({
          user_id: req?.session?.userId,
          platform: "twitter",
        });
    }

    return res.redirect(`${process.env.WEBSITE}/home`);
  } catch (error) {
    console.error("Twitter callback failed:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const twitterPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req?.user?.id || req.body?.id;

    const result = await postTweet(userId, content);

    return res
      .status(200)
      .json({ message: "Tweet posted successfully", tweet: result });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { twitterLogin, twitterCallBack, twitterPost };
