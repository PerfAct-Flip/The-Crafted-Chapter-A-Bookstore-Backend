import { prisma } from "../lib/prisma";
import { Product } from "../models/Product";
import products from "./data";

async function main() {
  console.log("Starting data seeding.")
  for (const book of products)
    await prisma.book.upsert({
      where: { title: book.title },
      update: {
        title: book.title,
        author: book.author,
        price: book.price,
        description: book.description,
        coverImage: book.coverImage,
        genres: book.genres,
      },
      create: book,
    });
  console.log("Books seeding completed!!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
