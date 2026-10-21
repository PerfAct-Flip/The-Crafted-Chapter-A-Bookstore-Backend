import { Router } from "express";
import { createOrder, getMyOrders, getOrderById } from "./order.controller";
import { protect } from "../../middleware/auth";

const router = Router();
router.use(protect);
// Matches GET /api/orders
router.get('/', getMyOrders);

// Matches POST /api/orders
router.post('/', createOrder);

// Matches GET /api/orders/:id
router.get('/:id', getOrderById);

export default router;