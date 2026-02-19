import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    toggleFavorite,
    updateProduct
} from "../controllers/productController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/favorite", protect, toggleFavorite);

export default router;