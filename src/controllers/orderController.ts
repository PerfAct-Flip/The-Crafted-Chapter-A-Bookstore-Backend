import { Response } from "express";
import { Order } from "../models/Order";
import { Cart } from "../models/Cart";
import { AuthRequest } from "../middleware/auth";

export const createOrder = async (req: AuthRequest, res: Response) => {
    const { shippingAddress } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        const orderItems = cart.items.map((item: any) => {
            const price = item.product.price;
            totalAmount += price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                price,
            };
        });

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
        });

        // Clear cart after order
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    try {
        const order = await Order.findById(req.params.id).populate("items.product");
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

