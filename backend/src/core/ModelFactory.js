import mongoose from 'mongoose';

/**
 * FACTORY PATTERN:
 * The ModelFactory uses the Factory Design Pattern to centralize and automate 
 * the creation of Mongoose models. Instead of manually defining schemas and 
 * compiling models for every entity, this class provides a single interface to 
 * "manufacture" complex Mongoose models dynamically from raw configuration (YAML). 
 * This decouples the entity definition from the technical implementation, 
 * allowing the framework to scale and adapt to any data structure at runtime.
 */

class ModelFactory {
  /** @type {Map<string, mongoose.Model>} */
  static #registry = new Map();

  /**
   * Maps YAML field definitions to Mongoose SchemaTypes.
   * 
   * @param {Object} entityConfig - The entity configuration object.
   * @returns {mongoose.Schema} The generated Mongoose Schema.
   */
  static createSchema(entityConfig) {
    const schemaDefinition = {};

    const typeMap = {
      'string': String,
      'number': Number,
      'boolean': Boolean,
      'date': Date,
      'objectId': mongoose.Schema.Types.ObjectId,
    };

    for (const [fieldName, fieldOptions] of Object.entries(entityConfig.fields)) {
      const fieldConfig = {
        type: typeMap[fieldOptions.type] || String,
        required: fieldOptions.required || false,
        unique: fieldOptions.unique || false,
      };

      // Add optional field properties if present
      if (fieldOptions.default !== undefined) fieldConfig.default = fieldOptions.default;
      if (fieldOptions.min !== undefined) fieldConfig.min = fieldOptions.min;
      if (fieldOptions.max !== undefined) fieldConfig.max = fieldOptions.max;
      if (fieldOptions.enum !== undefined) fieldConfig.enum = fieldOptions.enum;
      if (fieldOptions.ref !== undefined) fieldConfig.ref = fieldOptions.ref;

      schemaDefinition[fieldName] = fieldConfig;
    }

    return new mongoose.Schema(schemaDefinition, { timestamps: true });
  }

  /**
   * Creates and registers a new Mongoose model.
   * 
   * @param {string} name - Internal name for the model (e.g., "Product").
   * @param {Object} entityConfig - The raw entity configuration object.
   * @returns {mongoose.Model} The compiled Mongoose model.
   */
  static createModel(name, entityConfig) {
    if (this.#registry.has(name)) {
      return this.#registry.get(name);
    }

    const schema = this.createSchema(entityConfig);
    const model = mongoose.model(name, schema);
    
    this.#registry.set(name, model);
    return model;
  }

  /**
   * Retrieves a previously registered model from the registry.
   * 
   * @param {string} name - Name of the model to retrieve.
   * @returns {mongoose.Model | undefined} The Mongoose model or undefined if not found.
   */
  static getModel(name) {
    return this.#registry.get(name);
  }

  /**
   * Returns all registered models in the registry.
   * 
   * @returns {Object} An object mapping model names to models.
   */
  static getAllModels() {
    return Object.fromEntries(this.#registry);
  }

  /**
   * Triggers generation of all models from an array of entity configurations.
   * 
   * @param {Array<Object>} entities - Array of entity configurations.
   */
  static generateAll(entities) {
    if (!Array.isArray(entities)) return;
    
    entities.forEach(entity => {
      this.createModel(entity.name, entity);
    });
  }
}

export default ModelFactory;
