import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    coverImage: { type: String },
    genres: [{ type: String }],
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
