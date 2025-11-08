import crypto from "crypto";
import redisClient from "../db/redis.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import sql from "../sql.js";
import CryptoJS from "crypto-js";

const cookie_options = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging",
  domain:
    process.env.NODE_ENV === "development"
      ? "localhost"
      : ".rupakbasnet.com.np",
  maxAge: Number(process.env.COOKIE_EXPIRY) * 24 * 60 * 60 * 1000,
  sameSite: "none",
};

const googleCallBack = async (req, res) => {
  try {
    const user = req.user;

    const tempCode = crypto.randomUUID();

    await redisClient.set(tempCode, 60, JSON.stringify(user));

    return res.redirect(`http://localhost:3000/login/success?code=${tempCode}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    return res.redirect("http://localhost:3000/login");
  }
};

const exchangeToken = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    const userData = await redisClient.get(code);
    if (!userData)
      return res.status(400).json({ error: "Invalid or expired code" });

    await redisClient.del(code);

    const user = JSON.parse(userData);

    const token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.cookie("token", token, cookie_options);
    res.status(200).json({ message: "Exchange successful" });
  } catch (err) {
    console.error("Exchange failed:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const verifyGoogleToken = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const { token } = req.body;

    const decryptedToken = CryptoJS.AES.decrypt(
      token,
      process.env.TOKEN_SECRET
    ).toString(CryptoJS.enc.Utf8);

    const ticket = await client.verifyIdToken({
      idToken: decryptedToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Create or find user in DB
    let user = await sql("users").where({ email: payload.email }).first();
    if (!user) {
      user = await sql("users").insert({
        full_name: payload.name,
        email: payload.email,
        provider: "google",
        provider_id: payload.sub,
      });
    }

    // Issue your own app JWT/session
    const jwt_token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.cookie("token", jwt_token, cookie_options);
    res.status(200).json({
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid Google token" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie("token", cookie_options);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export {
  cookie_options,
  googleCallBack,
  exchangeToken,
  verifyGoogleToken,
  logout,
};
