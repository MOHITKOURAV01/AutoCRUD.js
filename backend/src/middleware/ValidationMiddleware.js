import Joi from 'joi';

/**
 * WHY JOI:
 * We use Joi instead of manual validation because it provides a declarative 
 * and highly readable way to define complex schema constraints. Manual validation 
 * is error-prone, repetitive, and difficult to scale as entity structures grow. 
 * Joi allows us to auto-generate industrial-grade validation logic dynamically 
 * from YAML configurations, ensuring that all data entering our database 
 * is sanitized and compliant with the defined schema.
 */

class ValidationMiddleware {
  /**
   * Generates a Joi schema object based on the entity's field definitions.
   * 
   * @param {Object} fields - The fields configuration for an entity.
   * @returns {Joi.ObjectSchema} The compiled Joi schema.
   */
  static generateJoiSchema(fields) {
    const schemaObj = {};

    const typeMap = {
      'string': Joi.string(),
      'number': Joi.number(),
      'boolean': Joi.boolean(),
      'date': Joi.date(),
      'objectId': Joi.string().length(24).hex().message('Must be a valid 24-character hex string (ObjectId)')
    };

    for (const [fieldName, fieldOptions] of Object.entries(fields)) {
      let fieldSchema = typeMap[fieldOptions.type] || Joi.any();

      // Apply required constraint
      if (fieldOptions.required) {
        fieldSchema = fieldSchema.required();
      } else {
        fieldSchema = fieldSchema.optional();
      }

      // Apply min/max constraints
      if (fieldOptions.min !== undefined) fieldSchema = fieldSchema.min(fieldOptions.min);
      if (fieldOptions.max !== undefined) fieldSchema = fieldSchema.max(fieldOptions.max);

      // Apply default value
      if (fieldOptions.default !== undefined) fieldSchema = fieldSchema.default(fieldOptions.default);

      // Apply enum (valid values)
      if (fieldOptions.enum && Array.isArray(fieldOptions.enum)) {
        fieldSchema = fieldSchema.valid(...fieldOptions.enum);
      }

      schemaObj[fieldName] = fieldSchema;
    }

    return Joi.object(schemaObj);
  }

  /**
   * Returns an Express middleware that validates the request body.
   * 
   * @param {Object} fields - The fields configuration for an entity.
   * @returns {Function} Express middleware function.
   */
  static validate(fields) {
    const schema = this.generateJoiSchema(fields);

    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, { 
        abortEarly: false, // Report all errors at once
        stripUnknown: true // Remove fields not defined in the schema
      });

      if (error) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(err => ({
            field: err.path[0],
            message: err.message.replace(/\"/g, '')
          }))
        });
      }

      // Reassign validated and stripped body back to req.body
      req.body = value;
      next();
    };
  }

  /**
   * Middleware to validate that req.params.id is a valid MongoDB ObjectId string.
   * 
   * @returns {Function} Express middleware function.
   */
  static validateId() {
    return (req, res, next) => {
      const schema = Joi.string().length(24).hex().required();
      const { error } = schema.validate(req.params.id);

      if (error) {
        return res.status(422).json({
          success: false,
          message: 'Invalid ID format',
          errors: [{ field: 'id', message: 'ID must be a 24-character hexadecimal string' }]
        });
      }

      next();
    };
  }
}

export default ValidationMiddleware;
