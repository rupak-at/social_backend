import mongoose from "mongoose";

const PostMetricsSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "ScheduledPost", required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
});

export default mongoose.model("PostMetrics", PostMetricsSchema);
