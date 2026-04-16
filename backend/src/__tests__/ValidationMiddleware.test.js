import { jest } from '@jest/globals';
import Joi from 'joi';
import ValidationMiddleware from '../middleware/ValidationMiddleware.js';

describe('ValidationMiddleware', () => {
    let mockReq;
    let mockRes;
    let next;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    it('generateJoiSchema() should map types correctly', () => {
        const fields = {
            name: { type: 'string', required: true },
            age: { type: 'number', min: 18 },
            active: { type: 'boolean' }
        };

        const schema = ValidationMiddleware.generateJoiSchema(fields);
        expect(schema.type).toBe('object');
        
        // Test valid object
        const { error } = schema.validate({ name: 'John', age: 20, active: true });
        expect(error).toBeUndefined();
        
        // Test invalid object (missing required)
        const { error: error2 } = schema.validate({ age: 20 });
        expect(error2).toBeDefined();
    });

    it('validate() should return 422 if required field is missing', () => {
        const fields = {
            email: { type: 'string', required: true }
        };
        
        const middleware = ValidationMiddleware.validate(fields);
        mockReq.body = {}; // Missing email

        middleware(mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Validation failed'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('validate() should call next() and strip unknown fields if payload is valid', () => {
        const fields = {
            name: { type: 'string' }
        };
        
        const middleware = ValidationMiddleware.validate(fields);
        mockReq.body = { name: 'Alice', unknown: 'hack' };

        middleware(mockReq, mockRes, next);

        expect(next).toHaveBeenCalled();
        expect(mockReq.body).toEqual({ name: 'Alice' }); // unknown should be stripped
        expect(mockReq.body.unknown).toBeUndefined();
    });

    it('validateId() should reject non-hex strings with 422', () => {
        const middleware = ValidationMiddleware.validateId();
        mockReq.params.id = 'not-a-hex';

        middleware(mockReq, mockRes, next);

        expect(mockRes.status).toHaveBeenCalledWith(422);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Invalid ID format'
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('validateId() should accept valid 24-char hex strings', () => {
        const middleware = ValidationMiddleware.validateId();
        mockReq.params.id = '507f1f77bcf86cd799439011'; // Valid ObjectId hex

        middleware(mockReq, mockRes, next);

        expect(next).toHaveBeenCalled();
    });
});
