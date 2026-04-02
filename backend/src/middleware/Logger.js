/**
 * Logger - Custom logger for AutoCRUD.js with color-coded status tracking.
 * Provides morgan-style logging and environment-aware verbosity.
 */
class Logger {
  static #colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
  };

  /**
   * General info log.
   * @param {string} message 
   */
  static info(message) {
    console.log(`${this.#colors.cyan}[INFO]${this.#colors.reset} ${this.#getTimestamp()} - ${message}`);
  }

  /**
   * Success log (typically for HTTP 2xx).
   * @param {string} message 
   */
  static success(message) {
    console.log(`${this.#colors.green}[SUCCESS]${this.#colors.reset} ${this.#getTimestamp()} - ${message}`);
  }

  /**
   * Warning log.
   * @param {string} message 
   */
  static warn(message) {
    console.warn(`${this.#colors.yellow}[WARN]${this.#colors.reset} ${this.#getTimestamp()} - ${message}`);
  }

  /**
   * Error log.
   * @param {string} message 
   */
  static error(message) {
    console.error(`${this.#colors.red}[ERROR]${this.#colors.reset} ${this.#getTimestamp()} - ${message}`);
  }

  /**
   * Debug log. only displays in non-production environments.
   * @param {string} message 
   */
  static debug(message) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`${this.#colors.gray}[DEBUG]${this.#colors.reset} ${this.#getTimestamp()} - ${message}`);
    }
  }

  /**
   * Express middleware for request logging (morgan-style).
   */
  static requestLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl;
      
      let color = Logger.#colors.green;
      if (status >= 500) color = Logger.#colors.red;
      else if (status >= 400) color = Logger.#colors.red;
      else if (status >= 300) color = Logger.#colors.yellow;

      console.log(
        `${color}${method}${Logger.#colors.reset} ${url} ` +
        `${color}${status}${Logger.#colors.reset} - ${duration}ms`
      );
    });

    next();
  }

  /**
   * Internal helper to get formatted timestamp.
   * @returns {string}
   */
  static #getTimestamp() {
    return new Date().toISOString();
  }
}

export default Logger;
