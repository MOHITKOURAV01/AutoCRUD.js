/**
 * ResponseFormatter - Static class to standardize all API response structures.
 */
class ResponseFormatter {
  /**
   * Standards for successful responses.
   * 
   * @param {Object} res - Express response object.
   * @param {any} data - The data payload to return.
   * @param {number} [statusCode=200] - HTTP status code.
   * @param {string} [message='Success'] - Personalised success message.
   * @returns {Object} JSON response.
   */
  static success(res, data, statusCode = 200, message = 'Success') {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Standards for error responses.
   * 
   * @param {Object} res - Express response object.
   * @param {string} [message='Server Error'] - Human-readable error message.
   * @param {number} [statusCode=500] - HTTP status code.
   * @param {Array} [errors=[]] - Array of specific validation or logic errors.
   * @returns {Object} JSON response.
   */
  static error(res, message = 'Server Error', statusCode = 500, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Standards for paginated list responses.
   * 
   * @param {Object} res - Express response object.
   * @param {Array} data - The page of records.
   * @param {number} page - Current page number.
   * @param {number} limit - Number of records per page.
   * @param {number} total - Total records in the collection.
   * @returns {Object} JSON response with pagination metadata.
   */
  static paginated(res, data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

export default ResponseFormatter;
