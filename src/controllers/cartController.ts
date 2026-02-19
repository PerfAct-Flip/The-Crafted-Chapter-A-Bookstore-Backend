import { Response } from "express";
import { Cart } from "../models/Cart";
import { AuthRequest } from "../middleware/auth";

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        let cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            if (item) {
                item.quantity += quantity || 1;
            }
        } else {
            cart.items.push({ product: productId, quantity: quantity || 1 } as any);
        }

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate("items.product");
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate("items.product");
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
