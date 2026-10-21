import { Router } from "express";
import { protect } from "../../middleware/auth";
import { getCart, addToCart, removeFromCart, clearCart } from "./cart.controller";
const router = Router();
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.delete("/:bookId", removeFromCart);
export default router;