import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../types/common";
import { success, error } from "../../utils/response";
import {
  addItem,
  findOrCreateCart,
  removeItem,
  clear
} from "./cart.service";

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);
    const cart = await findOrCreateCart(userId);
    return success(res, cart);
  } catch (e) {
    next(e);
  }
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);

    const { bookId, quantity = 1 } = req.body;

    if (typeof bookId !== "string" || !bookId) {
      return error(res, "INVALID_BOOK_ID", "bookId is required", {}, 400);
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return error(res, "INVALID_QUANTITY", "quantity must be a positive integer", {}, 400);
    }

    const cart = await findOrCreateCart(userId);
    const item = await addItem(cart.id, bookId, quantity);

    if (!item) return error(res, "BOOK_NOT_FOUND", "book not found", {}, 404);

    return success(res, item);
  } catch (e) {
    next(e);
  }
};

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);
    const cart = await findOrCreateCart(userId);
    const { bookId } = req.body;
    const updatedCart = await removeItem(cart.id, bookId);
    return success(res, updatedCart);
  } catch (e) {
    next(e);
  }
}

export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);
    const cart = await clear(userId);
    return success(res, cart);
  }catch(e){
    next(e);
  }
}
