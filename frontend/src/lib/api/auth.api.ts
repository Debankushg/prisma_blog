import type { AuthResponse } from "@/types";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import { http } from "./http";

export const authApi = {
  register: (input: RegisterInput) => http.post<AuthResponse>("/auth/register", input),
  login: (input: LoginInput) => http.post<AuthResponse>("/auth/login", input),
  logout: () => http.post<null>("/auth/logout"),
};
