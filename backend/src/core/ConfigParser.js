import fs from 'fs';
import yaml from 'js-yaml';

/**
 * Custom error class for configuration validation failures.
 */
class ConfigValidationError extends Error {
    /**
     * @param {string} message - Validation error message.
     */
    constructor(message) {
        super(message);
        this.name = "ConfigValidationError";
    }
}

/**
 * ConfigParser - Handles loading, parsing, and validating the YAML configuration for AutoCRUD.js.
 * Implements a singleton-adjacent pattern where the config is immutable once loaded.
 */
class ConfigParser {
    #filePath;
    #config;
    #isLoaded = false;

    /**
     * @param {string} filePath - Absolute path to the YAML configuration file.
     */
    constructor(filePath) {
        if (!filePath) {
            throw new ConfigValidationError("File path is required for ConfigParser.");
        }
        this.#filePath = filePath;
        this.#config = null;
    }

    /**
     * Reads and parses the YAML file from the filesystem.
     * @returns {Object} The parsed YAML data.
     * @throws {Error} If file reading or parsing fails.
     */
    loadYAML() {
        if (this.#isLoaded) return this.#config;

        try {
            const fileContents = fs.readFileSync(this.#filePath, 'utf8');
            this.#config = yaml.load(fileContents);
            this.validateSchema();
            this.#isLoaded = true;
            
            // Make config immutable
            Object.freeze(this.#config);
            if (this.#config.project) Object.freeze(this.#config.project);
            if (this.#config.entities) {
                Object.freeze(this.#config.entities);
                this.#config.entities.forEach(entity => {
                    Object.freeze(entity);
                    if (entity.fields) Object.freeze(entity.fields);
                });
            }

            return this.#config;
        } catch (error) {
            if (error instanceof ConfigValidationError) throw error;
            throw new Error(`Failed to load YAML: ${error.message}`);
        }
    }

    /**
     * Validates the structure and data types of the parsed configuration.
     * @throws {ConfigValidationError} If any schema requirement is not met.
     */
    validateSchema() {
        if (!this.#config) {
            throw new ConfigValidationError("Configuration data is missing. Call loadYAML() first.");
        }

        // Project Validation
        if (!this.#config.project) {
            throw new ConfigValidationError("Missing 'project' section in config.");
        }

        if (typeof this.#config.project.name !== 'string') {
            throw new ConfigValidationError("Project 'name' must be a string.");
        }

        if (typeof this.#config.project.port !== 'number') {
            throw new ConfigValidationError("Project 'port' must be a number.");
        }

        // Entities Validation
        if (!this.#config.entities || !Array.isArray(this.#config.entities) || this.#config.entities.length === 0) {
            throw new ConfigValidationError("'entities' must be a non-empty array.");
        }

        const validTypes = ['string', 'number', 'boolean', 'date', 'objectId'];

        this.#config.entities.forEach((entity, index) => {
            if (!entity.name || typeof entity.name !== 'string') {
                throw new ConfigValidationError(`Entity at index ${index} must have a valid 'name' (string).`);
            }

            if (!entity.fields || typeof entity.fields !== 'object' || Array.isArray(entity.fields)) {
                throw new ConfigValidationError(`Entity '${entity.name}' must have a valid 'fields' object.`);
            }

            // Fields Deep Validation
            for (const [fieldName, fieldOptions] of Object.entries(entity.fields)) {
                if (!fieldOptions.type || !validTypes.includes(fieldOptions.type)) {
                    throw new ConfigValidationError(`Field '${fieldName}' in entity '${entity.name}' has an invalid or missing type. Must be one of: ${validTypes.join(', ')}`);
                }
            }
        });
    }

    /**
     * Returns the fully validated configuration object.
     * @returns {Object} The immutable configuration object.
     */
    getParsedData() {
        if (!this.#isLoaded) this.loadYAML();
        return this.#config;
    }

    /**
     * Returns only the array of entity definitions.
     * @returns {Array<Object>} The entities configuration.
     */
    getEntities() {
        if (!this.#isLoaded) this.loadYAML();
        return this.#config.entities;
    }
}

export { ConfigValidationError };
export default ConfigParser;
