import { prisma } from "../../lib/prisma";
import type { Cart, CartItem, User } from "../../../generated/prisma/client";
import { Prisma } from "../../../generated/prisma/client";
import { findById } from "../product/product.service";
type Db = Prisma.TransactionClient;

// helper functions
export const getValidCartForOrder = async (userId: string, db: Db = prisma) => {
    const cart = await db.cart.findFirst({
        where: { userId },
        include: {
            cartItems: {
                include : { book : true }
            },
        },
    });

    if (!cart) {
        throw new Error("Cart not found. Please add items to your cart first.");
    }

    // Check 2: Cart is not empty
    if (cart.cartItems.length === 0) {
        throw new Error("Cannot create order from an empty cart.");
    }
    if (cart.cartItems.some((i) => i.book.deletedAt)) {
        throw new Error("Some items are no longer available.");
    }

    return cart;
};

// main functions
export const findOrCreateCart = async (userId: string) => {
    try {
        const existingCart = await prisma.cart.findFirst({ where: { userId } });
        if (existingCart) return existingCart;
        return await prisma.cart.create({ data: { userId } });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            // Race condition: another request created the cart simultaneously
            // Retry the lookup
            const cart = await prisma.cart.findFirst({ where: { userId } });
            if (cart) return cart;
        }
        throw e;
    }
};

export const addItem = async (
    cartId: string,
    bookId: string,
    quantity: number
) => {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Invalid quantity");

    const book = await findById(bookId);
    if (!book) return null;

    return await prisma.$transaction(async (tx) => {
        await tx.cartItem.upsert({
            where: { cartId_bookId: { cartId, bookId } },
            update: {
                quantity: { increment: quantity },
                price: book.price,
            },
            create: {
                cartId,
                bookId,
                quantity,
                price: book.price,
            },
        },
        );
        const items = await tx.cartItem.findMany({ where: { cartId } });
        const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
        return tx.cart.update({
            where: { id: cartId },
            data: { totalPrice },
            include: { cartItems: { include: { book: true } } },
        });
    });
}
export const removeItem = async (
    cartId: string,
    bookId: string
) => {

    const cartItem = await prisma.cartItem.findUnique({
        where: { cartId_bookId: { cartId, bookId } },
    });

    if (!cartItem) throw new Error("Cart item not found");

    return await prisma.cart.update({
        where: { id: cartId },
        data: {
            cartItems: {
                delete: { cartId_bookId: { cartId, bookId } },
            },
            totalPrice: {
                decrement: cartItem.price * cartItem.quantity,
            },
        },
        include: {
            cartItems: { include: { book: true } },
        },
    });
};

export const clear = async (userId: string, db : Db = prisma) => {
    const cart = await db.cart.findFirst({ where: { userId } });
    if (cart) {
        return await prisma.cart.update({
            where: { id: cart.id },
            data: {
                cartItems: {
                    deleteMany: {},
                },
                totalPrice: 0,
            },
            include: {
                cartItems: {
                    include: { book: true },
                },
            },
        });
    }

};
