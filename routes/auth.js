import express from "express";
import passport from "passport";

import { exchangeToken, googleCallBack } from "../controller/auth.js";

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

export default router;
