import crypto from "crypto";
import redisClient from "../db/redis.js";
import jwt from "jsonwebtoken";

const cookie_options = {
  httpOnly: true,
  secure: true,
  maxAge: process.env.COOKIE_EXPIRY,
  sameSite: "None",
};

const googleCallBack = async (req, res) => {
  try {
    const user = req.user;

    const tempCode = crypto.randomUUID();

    await redisClient.set(tempCode, 60, JSON.stringify(user));

    return res.redirect(`http://localhost:3000/login/success?code=${tempCode}`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    return res.redirect("http://localhost:3000/login/failure");
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
    res.json({ message: "Exchange successful" });
  } catch (err) {
    console.error("Exchange failed:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export { cookie_options, googleCallBack, exchangeToken };
