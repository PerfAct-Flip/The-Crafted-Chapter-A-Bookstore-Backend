import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/common";
import { success, error } from "../../utils/response";
import * as favoriteService from "./favorite.service";
import { UUID_RE } from "../../utils/helper";
export const toggleFavorite = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);

    const { bookId } = req.params;
    if (typeof bookId !== "string" || !UUID_RE.test(bookId)) {
      return error(res, "INVALID_BOOK_ID", "bookId is not valid", {}, 400);
    }

    const result = await favoriteService.toggleFavorite(userId, bookId);
    if (!result) return error(res, "BOOK_NOT_FOUND", "book not found", {}, 404);

    return success(res, result, {}, 200);
  } catch (e) {
    next(e);
  }
};