import type { Prisma, User } from "@prisma/client";
import { prisma } from "../configs/database";
import type { PublicUser } from "../types";

/** Never select the password hash unless explicitly needed. */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  age: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const UserModel = {
  findByEmail: (email: string): Promise<User | null> =>
    prisma.user.findUnique({ where: { email } }),

  findPublicById: (id: string): Promise<PublicUser | null> =>
    prisma.user.findUnique({ where: { id }, select: publicUserSelect }),

  create: (data: Prisma.UserCreateInput): Promise<PublicUser> =>
    prisma.user.create({ data, select: publicUserSelect }),
};
