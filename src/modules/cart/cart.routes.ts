import { Router } from "express";
import { protect } from "../../middleware/auth";
import { getCart, addToCart, removeFromCart, clearCart } from "./cart.controller";
const router = Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);
router.delete("/", protect, clearCart);

export default router;