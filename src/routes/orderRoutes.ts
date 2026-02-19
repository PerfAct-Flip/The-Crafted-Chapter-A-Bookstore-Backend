import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = Router();

// Matches GET /api/orders
router.get('/', protect, getMyOrders);

// Matches POST /api/orders
router.post('/', protect, createOrder);

// Matches GET /api/orders/:id
router.get('/:id', protect, getOrderById);

export default router;