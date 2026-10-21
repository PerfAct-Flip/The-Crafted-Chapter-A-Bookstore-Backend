import { Router } from "express";
import { protect } from "../../middleware/auth";
import { 
    toggleFavorite
} from "./favorite.controller";

const router = Router();

router.post("/:id/favorite", protect, toggleFavorite);

export default router;