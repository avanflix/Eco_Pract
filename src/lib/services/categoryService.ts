import "server-only";
import { connectDB } from "@/src/lib/mongodb";
import category from "@/src/models/category";
export async function getCategories() {
  await connectDB();

  return category.find()
    .lean()
    .exec();
}

export async function getCategoryBySlug(
  slug: string
) {
  await connectDB();

  return category.findOne({
    slug,
  })
    .lean()
    .exec();
}