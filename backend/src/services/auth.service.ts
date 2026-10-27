import { Prisma } from "@prisma/client";
import { env } from "../configs/env";
import { PasswordResetModel } from "../models/passwordReset.model";
import { UserModel } from "../models/user.model";
import type { AuthResult, PublicUser } from "../types";
import { ApiError } from "../utils/ApiError";
import { toApiError } from "../utils/handleError";
import { signToken } from "../utils/jwt";
import { sendPasswordResetEmail } from "../utils/mailer";
import { comparePassword, hashPassword } from "../utils/password";
import { generateResetToken, hashToken } from "../utils/token";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

const toPublic = ({
  password: _password,
  ...rest
}: Prisma.UserGetPayload<object>): PublicUser => rest;

export const AuthService = {
  async register({
    name,
    email,
    password,
    age,
  }: RegisterInput): Promise<AuthResult> {
    try {
      const user = await UserModel.create({
        name,
        email,
        age,
        password: await hashPassword(password),
      });
      return { user, token: signToken({ sub: user.id, email: user.email }) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw ApiError.conflict("Email is already registered");
      }
      throw toApiError(error, "registering user");
    }
  },

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    try {
      const user = await UserModel.findByEmail(email);
      // Same error for unknown email and wrong password to avoid user enumeration.
      if (!user || !(await comparePassword(password, user.password))) {
        throw ApiError.unauthorized("Invalid email or password");
      }
      return {
        user: toPublic(user),
        token: signToken({ sub: user.id, email: user.email }),
      };
    } catch (error) {
      throw toApiError(error, "logging in");
    }
  },

  /** Resolves silently for unknown emails so the endpoint can't be used to discover accounts. */
  async forgotPassword({ email }: ForgotPasswordInput): Promise<void> {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) return;

      const { token, tokenHash } = generateResetToken();
      await PasswordResetModel.replaceForUser(
        user.id,
        tokenHash,
        new Date(Date.now() + env.RESET_TOKEN_EXPIRES_MIN * 60_000),
      );

      const link = `${env.RESET_PASSWORD_URL}?token=${token}`;
      // Not awaited: keeps response time identical for existing and unknown emails.
      // A mail failure must never fail the request, so it is only logged.
      sendPasswordResetEmail(user.email, user.name, link).catch(
        (error: unknown) =>
          console.error("[mail] Failed to send password reset email", error),
      );
    } catch (error) {
      throw toApiError(error, "starting password reset");
    }
  },

  async resetPassword({ token, password }: ResetPasswordInput): Promise<void> {
    try {
      const record = await PasswordResetModel.findValid(hashToken(token));
      if (!record) throw ApiError.badRequest("Invalid or expired reset token");
      await PasswordResetModel.consumeAndSetPassword(
        record.userId,
        await hashPassword(password),
      );
    } catch (error) {
      throw toApiError(error, "resetting password");
    }
  },

  async getProfile(userId: string): Promise<PublicUser> {
    try {
      const user = await UserModel.findPublicById(userId);
      if (!user) throw ApiError.unauthorized("Account no longer exists");
      return user;
    } catch (error) {
      throw toApiError(error, "loading profile");
    }
  },
};
