import express from 'express';
import rateLimit from 'express-rate-limit';
import ValidationMiddleware from '../middleware/ValidationMiddleware.js';

/**
 * DYNAMIC ROUTING:
 * The RouteGenerator is the final bridge in the AutoCRUD.js engine. 
 * By dynamically binding controllers and validation logic to auto-generated paths, 
 * this class eliminates the need for hundreds of lines of manual boilerplate code 
 * (e.g., router.get, router.post, router.put). This ensure that every entity 
 * instantly receives a production-grade RESTful surface with consistent error 
 * handling, security throttling, and data validation without a single line 
 * of code being written by the developer.
 */

class RouteGenerator {
  #app;
  #routes = [];

  /**
   * @param {Object} expressApp - The main Express application instance.
   */
  constructor(expressApp) {
    this.#app = expressApp;
    this.#setupGlobalThrottling();
  }

  /**
   * Generates and mounts RESTful routes for all provided entities.
   * 
   * @param {Array<Object>} entities - Array of entity configuration objects.
   * @param {Map<string, Object>} controllersMap - Map of { name -> controllerInstance }.
   * @param {Map<string, Object>} modelsMap - Map of { name -> MongooseModel }.
   */
  generateRoutes(entities, controllersMap, modelsMap) {
    entities.forEach(entity => {
      const router = express.Router();
      const controller = controllersMap.get(entity.name);
      
      if (!controller) {
        console.warn(`⚠️ No controller found for entity: ${entity.name}`);
        return;
      }

      // Resource name transformation (Product -> products)
      const resource = entity.name.toLowerCase() + 's';
      const baseLogPath = `/api/v1/${resource}`;

      // 1. GET ALL
      router.get('/', controller.getAll);

      // 2. CREATE (with Validation)
      router.post('/', 
        ValidationMiddleware.validate(entity.fields), 
        controller.create
      );

      // 3. GET BY ID (with ID Validation)
      router.get('/:id', 
        ValidationMiddleware.validateId(), 
        controller.getById
      );

      // 4. UPDATE (with ID + Body Validation)
      router.put('/:id', 
        ValidationMiddleware.validateId(), 
        ValidationMiddleware.validate(entity.fields), 
        controller.update
      );

      // 5. DELETE (with ID Validation)
      router.delete('/:id', 
        ValidationMiddleware.validateId(), 
        controller.delete
      );

      // 6. SCHEMA META ENDPOINT
      router.get('/meta/schema', (req, res) => {
        res.json({
          success: true,
          entity: entity.name,
          fields: entity.fields
        });
      });

      // Mount the router
      const mountPath = `/api/v1/${resource}`;
      this.#app.use(mountPath, router);

      // Register routes for meta discovery
      this.#registerDiscoveryRoutes(resource, entity.name);
      
      console.log(`📡 AutoCRUD Routes Live: [${mountPath}]`);
    });
  }

  /**
   * Returns a list of all dynamically registered routes.
   * Useful for internal discovery endpoints or documentation.
   * 
   * @returns {Array<Object>} Array of { method, path, entity }.
   */
  getRegisteredRoutes() {
    return this.#routes;
  }

  /**
   * Internal helper to track routes for the discovery API.
   * 
   * @param {string} resource - The lowercased, pluralized resource name.
   * @param {string} entityName - The original entity name.
   */
  #registerDiscoveryRoutes(resource, entityName) {
    const methods = [
      { method: 'GET', path: `/api/v1/${resource}` },
      { method: 'POST', path: `/api/v1/${resource}` },
      { method: 'GET', path: `/api/v1/${resource}/:id` },
      { method: 'PUT', path: `/api/v1/${resource}/:id` },
      { method: 'DELETE', path: `/api/v1/${resource}/:id` },
      { method: 'GET', path: `/api/v1/${resource}/meta/schema` }
    ];

    methods.forEach(m => {
      this.#routes.push({ ...m, entity: entityName });
    });
  }

  /**
   * Sets up rate limiting to prevent brute force and API overusage.
   */
  #setupGlobalThrottling() {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per window
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.#app.use('/api', limiter);
  }
}

export default RouteGenerator;
