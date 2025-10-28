import mongoose from "mongoose";

const ScheduledPostSchema = new mongoose.Schema({
  sql_id: {
    type: Number, // references MySQL user.id
    required: true
  },
  platform: {
    type: String,
    enum: ["facebook", "twitter", "linkedin", "instagram"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  media_url: {
    type: String
  },
  schedule_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["scheduled", "posted", "failed"],
    default: "scheduled"
  },
  post_response: {
    type: Object 
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("ScheduledPost", ScheduledPostSchema);
