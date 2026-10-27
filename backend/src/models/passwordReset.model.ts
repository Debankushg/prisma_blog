import type { PasswordResetToken } from "@prisma/client";
import { prisma } from "../configs/database";

export const PasswordResetModel = {
  /** Replaces any outstanding tokens so only the latest link works. */
  replaceForUser: async (
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> => {
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
      prisma.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt },
      }),
    ]);
  },

  findValid: (tokenHash: string): Promise<PasswordResetToken | null> =>
    prisma.passwordResetToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    }),

  /** Sets the new password and burns every reset token for the user, atomically. */
  consumeAndSetPassword: async (
    userId: string,
    passwordHash: string,
  ): Promise<void> => {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
    ]);
  },
};
