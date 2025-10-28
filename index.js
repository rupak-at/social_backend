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
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
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
