import { prisma} from "../../lib/prisma";
import type { Cart, CartItem, User} from "../../../generated/prisma/client";
import { Prisma } from "../../../generated/prisma/client";
// export const get = async (userId: string): Promise<Cart | null> => {
//     return await prisma.cart.findFirst({
//         where: { userId }
//     })
// }
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

// export const create = async (userId: string): Promise<Cart> => {
//     try {
//         const cart = await prisma.cart.create({
//             data: { userId },
//         });
//         return cart;
//     } catch (error) {
//         if ((error as { code?: string }).code === 'P2002') {
//             throw new Error('A cart already exists for this user.');
//         }
//         throw error;
//     }
// };

export const add = async (
    cartId: string,
    bookId: string,
    quantity: number,
    price: number
): Promise<Cart | null> => {
    const cart = await prisma.cart.update({
        where: { id: cartId },
        data: {
            cartItems: {
                upsert: {
                    where: { cartId_bookId: { cartId, bookId } },
                    update: {
                        quantity: { increment: quantity },
                    },
                    create: {
                        bookId,
                        quantity,
                        price,
                    },
                },
            },

            totalPrice: {
                increment: price * quantity,
            },
        },
        include: {
            cartItems: {
                include: { book: true },
            },
        },
    })
    return cart;
}

export const remove = async (
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

export const clear = async (userId: string) => {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if(cart) {
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
