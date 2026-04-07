import ResponseFormatter from '../utils/ResponseFormatter.js';

/**
 * BaseController - A robust, abstract base class for handling CRUD operations.
 * Designed to be extended or dynamically instantiated for any Mongoose model.
 */
class BaseController {
  /**
   * @param {Object} model - The Mongoose model associated with this controller.
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * CREATE: Adds a new document to the database.
   * @route POST /
   */
  create = async (req, res, next) => {
    try {
      const doc = await this.model.create(req.body);
      return ResponseFormatter.success(res, doc, 201, 'Resource created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET ALL: Retrieves documents with support for pagination, sorting, and filtering.
   * @route GET /
   */
  getAll = async (req, res, next) => {
    try {
      const { filters, options } = this._buildQuery(req.query);
      
      const total = await this.model.countDocuments(filters);
      const docs = await this.model.find(filters, null, options);

      return res.status(200).json({
        success: true,
        message: 'Resources retrieved successfully',
        pagination: {
          total,
          page: options.skip / options.limit + 1,
          limit: options.limit,
          pages: Math.ceil(total / options.limit)
        },
        data: docs
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET BY ID: Retrieves a single document by its ID.
   * @route GET /:id
   */
  getById = async (req, res, next) => {
    try {
      const doc = await this.model.findById(req.params.id);
      if (!doc) {
        return ResponseFormatter.error(res, 'Resource not found', 404);
      }
      return ResponseFormatter.success(res, doc);
    } catch (error) {
      next(error);
    }
  };

  /**
   * UPDATE: Updates an existing document by its ID.
   * @route PUT /:id
   */
  update = async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return ResponseFormatter.error(res, 'Resource not found', 404);
      }
      return ResponseFormatter.success(res, doc, 200, 'Resource updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE: Removes a document from the database by its ID.
   * @route DELETE /:id
   */
  delete = async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return ResponseFormatter.error(res, 'Resource not found', 404);
      }
      return ResponseFormatter.success(res, null, 200, 'Resource deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * @protected
   * Helper to separate schema filters from pagination and sorting parameters.
   * 
   * @param {Object} queryParams - The raw req.query object.
   * @returns {Object} An object containing { filters, options }.
   */
  _buildQuery(queryParams) {
    const filters = { ...queryParams };
    
    // Remove pagination and sort keywords from filters
    const excludeFields = ['page', 'limit', 'sort', 'order'];
    excludeFields.forEach(param => delete filters[param]);

    // Setup pagination defaults
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Setup sorting defaults
    const sortField = queryParams.sort || 'createdAt';
    const sortOrder = queryParams.order === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    return {
      filters,
      options: { skip, limit, sort }
    };
  }
}

export default BaseController;
