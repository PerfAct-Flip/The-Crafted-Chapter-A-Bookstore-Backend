import { Router } from "express";
import { protect } from "../../middleware/auth";
import { getBooks, createBook, updateBook } from "./product.controller";

const router = Router();

router.get("/", getBooks);
// router.get("/:id", getProductById);
router.post("/", protect, createBook);
router.put("/:id", protect, updateBook);
// router.delete("/:id", protect, deleteBook);
// router.post("/:id/favorite", protect, toggleFavorite);

export default router;