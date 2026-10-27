export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
}
