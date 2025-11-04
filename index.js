import "dotenv/config";
import mongodb from "./db/mongo.js";
import sql from "./db/sql.js";
import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import "./config/passport.js";
import session from "express-session";
import redisClient from "./db/redis.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://no.rupakbasnet.com.np"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.NODE_ENV === "staging",
      domain: process.env.NODE_ENV === "development" ? undefined : ".rupakbasnet.com.np",
      sameSite: "none",
      httpOnly: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await mongodb();

    const conn = await sql.getConnection();
    console.log("✅ MySQL Connected @@@");
    conn.release();
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
