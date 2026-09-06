import { Router } from "express";
import { register, login, logout, me } from "./auth.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout)
router.get("/profile", auth, me);

export default router;
