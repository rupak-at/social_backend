import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import sql from "../sql.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await sql("users").where({ provider_id: profile.id }).first();

        if (!user) {
          const [new_user] = await sql("users")
            .insert({
              full_name: profile.displayName,
              email: profile.emails[0].value,
              provider: "google",
              provider_id: profile.id, 
            })
            .returning("*");

          user = new_user;
        }

        await sql("social_accounts")
          .insert({
            user_id: user.id,
            platform: "google",
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + 3600 * 1000),
            account_username: profile.displayName,
          })
          .onConflict(["user_id", "platform"])
          .merge();

        return done(null, user);
      } catch (error) {
        console.error("Google login error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;
