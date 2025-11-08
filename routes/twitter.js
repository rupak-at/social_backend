import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  twitterCallBack,
  twitterLogin,
  twitterPost,
} from "../controller/twitter.js";

const router = express.Router();

router.get("/login", verifyToken, twitterLogin);
router.get("/callback", twitterCallBack);
router.post("/post", twitterPost);

export default router;
