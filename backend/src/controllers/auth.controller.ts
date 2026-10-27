import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import type { AuthResponse, PublicUser } from "../types";
import { ApiError } from "../utils/ApiError";
import { clearAuthCookie, setAuthCookie } from "../utils/cookie";
import { sendSuccess } from "../utils/response";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

// Every handler forwards failures to the central error middleware (src/middleware/error.ts)
// through next(error), so the response format stays consistent.

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await AuthService.register(req.body);
    setAuthCookie(res, token);
    sendSuccess<AuthResponse>(res, 201, "Registered successfully", { user });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user, token } = await AuthService.login(req.body);
    setAuthCookie(res, token);
    sendSuccess<AuthResponse>(res, 200, "Logged in successfully", { user });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.auth) throw ApiError.unauthorized();
    const user = await AuthService.getProfile(req.auth.sub);
    sendSuccess<PublicUser>(res, 200, "Profile fetched", user);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<unknown, unknown, ForgotPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await AuthService.forgotPassword(req.body);
    sendSuccess<null>(
      res,
      200,
      "If an account exists for that email, a reset link has been sent",
      null,
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<unknown, unknown, ResetPasswordInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await AuthService.resetPassword(req.body);
    sendSuccess<null>(
      res,
      200,
      "Password has been reset. You can now log in",
      null,
    );
  } catch (error) {
    next(error);
  }
};

export const logout = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    clearAuthCookie(res);
    sendSuccess<null>(res, 200, "Logged out", null);
  } catch (error) {
    next(error);
  }
};
