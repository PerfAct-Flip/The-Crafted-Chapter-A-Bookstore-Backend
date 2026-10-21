import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../types/common";
import { success, error } from "../../utils/response";
import orderService from "./order.service";
import { UUID_RE } from "../../utils/helper";
export const getMyOrders = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;
        if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);
        const orders = await orderService.getMyOrders(userId);
        return success(res, orders, {}, 200);
    } catch (e) {
        next(e);
    }
};

export const createOrder = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;
        if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);
        const orders = await orderService.create(userId);
        return success(res, orders, {}, 201);
    } catch (e) {
        next(e);
    }
}

export const getOrderById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.user?.id;
        if (!userId) return error(res, "USER_NOT_FOUND", "user not found", {}, 401);

        const { orderId } = req.params;
        if (typeof orderId !== "string" || !UUID_RE.test(orderId)) {
            return error(res, "INVALID_ORDER_ID", "orderId is not valid", {}, 400);
        }

        const order = await orderService.getOrderById(userId, orderId);
        if (!order) return error(res, "ORDER_NOT_FOUND", "order not found", {}, 404);

        return success(res, order, {}, 200);
    } catch (e) {
        next(e);
    }
};