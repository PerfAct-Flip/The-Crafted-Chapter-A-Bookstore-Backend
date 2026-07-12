import { Router } from "express";
import { register, login, me } from "./auth.controller";
import { protect } from "../../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, me);

export default router;
