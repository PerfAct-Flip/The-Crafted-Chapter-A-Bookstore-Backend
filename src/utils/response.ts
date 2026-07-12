import type { Response} from "express";

interface ResponseMeta {
  timestamp: string;
  [key: string]: any;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string | number;
    message: string;
    details?: any;
  };
  meta: ResponseMeta;
}

const getTimestamp = (): string => new Date().toISOString();

export const success = <T>(res: Response, data: T, meta: object = {}, status = 200) => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    meta: { ...meta, timestamp: getTimestamp() },
  };
  return res.status(status).json(response);
};

export const error = (res: Response, code: string | number, message: string, details: any = {}, status = 400) => {
  const response: ErrorResponse = {
    success: false,
    error: { code, message, details },
    meta: { timestamp: getTimestamp() },
  };
  return res.status(status).json(response);
};
