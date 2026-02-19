import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db";
import { User } from "../models/User";
import { Product } from "../models/Product";
import products from "./data";

dotenv.config();

const seed = async () => {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();

    const password = await bcrypt.hash("123456", 10);

    const users = await User.insertMany([
        { name: "Test User 1", email: "test1@mail.com", password },
        { name: "Test User 2", email: "test2@mail.com", password }
    ]);

    await Product.insertMany(products);

    console.log("Seeded successfully");
    process.exit();
};

seed();