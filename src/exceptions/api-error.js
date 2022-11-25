module.exports = class ApiError extends (
  Error
) {
  status;
  errors;

  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'The user is not logged in.');
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static BadRequestForAdmin(message, errors = []) {
    return new ApiError(400, `You don't have permission to ${message} the product`, errors);
  }
};
