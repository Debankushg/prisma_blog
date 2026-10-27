export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: { path: string; message: string }[],
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(msg: string) { return new ApiError(400, msg); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static conflict(msg: string) { return new ApiError(409, msg); }
  static notFound(msg = 'Not found') { return new ApiError(404, msg); }
  static internal(msg = 'Something went wrong. Please try again.') { return new ApiError(500, msg); }
  static serviceUnavailable(msg = 'Service temporarily unavailable. Please try again shortly.') { return new ApiError(503, msg); }
}
