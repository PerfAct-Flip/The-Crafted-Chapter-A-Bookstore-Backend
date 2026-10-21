import { prisma } from "../../lib/prisma";
import type { Order, OrderItem, User } from "../../../generated/prisma/client";
import { Prisma } from "../../../generated/prisma/client";
import { error } from "../../utils/response";
import { getValidCartForOrder, clear } from "../cart/cart.service";

// 1. Create Order
export const create = async (userId: string) => {
    return await prisma.$transaction(async (tx) => {
        const cart = await getValidCartForOrder(userId, tx);

        const totalPrice = cart.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

        const order = await tx.order.create({
            data: {
                userId,
                totalPrice
            },
        });

        await tx.orderItem.createMany({
            data: cart.cartItems.map((i) => ({
                orderId: order.id,
                bookId: i.bookId,
                quantity: i.quantity,
                price: i.price,
                title: i.book.title,
                author: i.book.author,
                coverImage: i.book.coverImage,
            })),
        });

        await clear(userId, tx);

        return tx.order.findUnique({
            where: { id: order.id },
            include: { orderItems: true },
        });
    });
}

// 2.get Orders
export const getMyOrders = async (userId: string) => {
    return await prisma.order.findMany({
        where: { userId },
        include: { orderItems: true },
        orderBy: { createdAt: "desc" },
    });
}
// 3. get OrdersById
export const getOrderById = async (userId: string, orderId: string) => {
    return await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { orderItems: true },
    });
};
const orderService = { create, getMyOrders, getOrderById};
export default orderService;