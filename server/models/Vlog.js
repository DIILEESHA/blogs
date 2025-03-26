const mongoose = require("mongoose");

const vlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    coverImage: { type: String },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    category: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vlog", vlogSchema);