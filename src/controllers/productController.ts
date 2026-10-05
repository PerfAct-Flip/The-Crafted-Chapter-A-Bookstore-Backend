import type { Request, Response } from "express";
import { Product } from "../models/Product";
import { User } from "../models/User";
import type { AuthenticatedRequest } from "../types/common";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, author, price, description, coverImage, genres } = req.body;
    const product = await Product.create({
      title,
      author,
      price,
      description,
      coverImage,
      genres
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data" });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, author, price, description, coverImage, genres } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { title, author, price, description, coverImage, genres },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product data" });
  }
};


export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const productId = req.params.id as any;
    const index = user.favorites.indexOf(productId);

    if (index === -1) {
      user.favorites.push(productId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
