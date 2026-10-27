import type { Response } from 'express';
import type { ApiSuccess } from '../types';

export const sendSuccess = <T>(res: Response<ApiSuccess<T>>, statusCode: number, message: string, data: T) =>
  res.status(statusCode).json({ success: true, message, data });
