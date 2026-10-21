import { prisma } from "../lib/prisma";
import products from "./data";
// Use the same hashing helper your register controller uses, so login can verify this password.
import bcrypt from "bcryptjs";
import env from "../config/env";
async function seedBooks() {
  for (const book of products) {
    await prisma.book.upsert({
      where: { title: book.title },
      update: {
        author: book.author,
        price: book.price,
        description: book.description,
        coverImage: book.coverImage,
        genres: book.genres,
        deletedAt: null, // un-archive a book if it was soft-deleted
      },
      create: book,
    });
  }
  console.log(`Seeded ${products.length} books`);
}

// Optional: only runs when ADMIN_EMAIL and ADMIN_PASSWORD are set in .env
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin seed");
    return;
  }

  const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" }, // leaves the existing password untouched
    create: {
      name: "Admin",
      username: "admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${email}`);
}

async function main() {
  console.log("Starting data seeding.");
  await seedBooks();
  await seedAdmin();
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });