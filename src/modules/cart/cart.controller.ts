import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../types/common";
import { success, error } from "../../utils/response";
import {
  add,
  findOrCreateCart,
  remove,
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
    const { bookId, quantity, price } = req.body;
    const cart = await findOrCreateCart(userId);
    const item = await add(cart.id, bookId, quantity, price);
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
    const updatedCart = await remove(cart.id, bookId);
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
