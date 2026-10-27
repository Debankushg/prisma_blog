export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: { path: string; message: string }[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
