import { prisma } from "../../lib/prisma";
import type { Book, User } from "../../../generated/prisma/client";
import { email } from "zod";

export const findProducts = async (): Promise<Book[] | []> => {

    const products = await prisma.book.findMany();
    return products;
}

export const findById = async (identifier: string): Promise<Book | null> => {
    return prisma.book.findFirst({
        where: {
            OR: [{ id: identifier }, { email: identifier }],
        }
    });
}

export const create = async (productData: any): Promise<Book | null> => {
    const { title, author, price, description, coverImage, genres } = productData;
    const book = prisma.book.create({
        data: {
            title,
            author,
            price,
            description,
            coverImage: coverImage || null,
            genres: genres
        },
    });
    return book;
}
// add zod validation for input data
interface UpdateData {
 description: string;
 title: string;
 author: string;
 price: number;
 coverImage: string | null;
 genres: string[];
}

export const update = async (id: string, fields: UpdateData ) => {
    
    const newBook = await prisma.book.update({
        where: { id },
        data: {
            ...fields,
            ...(fields.genres && {
                genres: {
                    set : fields.genres,
                },
            }),
        },
    });

    return newBook;
};

export const deleteProduct = async (id: string) => {
    await prisma.book.delete({
        where : { id }
    })
}