import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/common";
import {
  findAllBooks,
  findByTitle,
  create,
  update,
  deleteBook,
} from "./product.service";
import { success, error } from "../../utils/response";
import { title } from "node:process";

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const title = req.query.title as string;
    if (title) {
      const product = await findByTitle(title);
      if (!product) {
        return error(res, "BOOK_NOT_FOUND", ` ${title} book not found`, {}, 404);
      }
      return success(res, product); 
    }
    const products = await findAllBooks();
    if (!products) {
      return error(res, "PRODUCTS_NOT_FOUND", "Products not found", {}, 404);
    }
    return success(res, products);
  } catch (e) {
    next(e);
  }
};

export const createBook = async(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
    try{
        const bookData = req.body;
        const book = await create(bookData);
        return success(res, book, {}, 201);

    }catch(e){
        next(e);
    }
}

export const updateBook = async(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
    try{
        const { id , newData } = req.body;
        if(!id){
            error(res,"ID_NOT_PROVIDED",'id not provided',{}, 400);
        }
        const book = await update(title,newData);
        return success(res, book, {}, 201);

    }catch(e){
        next(e);
    }
}
