import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth";


const generateToken = (id: string) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ token: generateToken(user._id.toString()) });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });


    res.json({ token: generateToken(user._id.toString()) });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
