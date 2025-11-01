import express from "express";
import passport from "passport";

import {
  exchangeToken,
  googleCallBack,
  verifyGoogleToken,
  logout,
} from "../controller/auth.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallBack
);

router.post("/exchange", exchangeToken);
router.post("/google/verify", verifyGoogleToken);
router.get("/logout", verifyToken, logout);

export default router;
