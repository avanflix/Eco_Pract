import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    image: String,
  },
  {
    timestamps: true,
    collection: "categories",
  }
);

export default mongoose.models.categories ||
  mongoose.model("categories", CategorySchema);