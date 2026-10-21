/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,book_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,book_id]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_book_id_fkey";

-- AlterTable
ALTER TABLE "books" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "author" VARCHAR(100) NOT NULL,
ADD COLUMN     "cover_image" VARCHAR(500),
ADD COLUMN     "title" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","book_id")
);

-- CreateIndex
CREATE INDEX "favorites_book_id_idx" ON "favorites"("book_id");

-- CreateIndex
CREATE INDEX "books_deleted_at_idx" ON "books"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_book_id_key" ON "cart_items"("cart_id", "book_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_book_id_idx" ON "order_items"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_book_id_key" ON "order_items"("order_id", "book_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
