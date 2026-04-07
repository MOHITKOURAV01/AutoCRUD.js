import BaseController from '../controllers/BaseController.js';

/**
 * FACTORY PATTERN:
 * The ControllerFactory uses the Factory Design Pattern to automate the 
 * instantiation of controller logic. Since the AutoCRUD.js framework generates 
 * dozens of RESTful endpoints dynamically, manually creating a controller file 
 * for each entity would be inefficient. This factory class abstracts the 
 * instantiation process, allowing the framework to produce fully functional, 
 * Mongoose-backed controllers at runtime while maintaining a unified interface.
 */

class ControllerFactory {
  /**
   * Creates an instance of a controller for a specific model.
   * 
   * @param {Object} model - The Mongoose model to bind the controller to.
   * @param {Object} entityConfig - Optional configuration for entity-specific logic.
   * @returns {BaseController} A new instance of BaseController.
   */
  static create(model, entityConfig = {}) {
    // In a more advanced version, we could look for custom controller classes 
    // to extend the BaseController based on entityConfig.
    return new BaseController(model);
  }

  /**
   * Batch creates controllers for multiple models.
   * 
   * @param {Map<string, Object>} modelsMap - A map of { entityName -> MongooseModel }.
   * @param {Array<Object>} entitiesConfig - The raw array of entity configurations.
   * @returns {Map<string, BaseController>} A map of { entityName -> ControllerInstance }.
   */
  static createAll(modelsMap, entitiesConfig) {
    const controllersMap = new Map();

    entitiesConfig.forEach(entity => {
      const model = modelsMap.get(entity.name);
      if (model) {
        const controller = this.create(model, entity);
        controllersMap.set(entity.name, controller);
      }
    });

    return controllersMap;
  }
}

export default ControllerFactory;
