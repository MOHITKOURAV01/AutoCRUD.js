import { jest } from '@jest/globals';
import ResponseFormatter from '../utils/ResponseFormatter.js';

describe('ResponseFormatter', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    it('success() should set status 200 and return correct body shape', () => {
        const data = { id: 1, name: 'Test' };
        const message = 'Success message';
        
        ResponseFormatter.success(mockRes, data, 200, message);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: message,
            data: data,
            timestamp: expect.any(String)
        }));
    });

    it('error() should set correct status and body shape', () => {
        const message = 'Error message';
        const errors = [{ field: 'email', message: 'invalid' }];
        
        ResponseFormatter.error(mockRes, message, 400, errors);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: message,
            errors: errors,
            timestamp: expect.any(String)
        }));
    });

    it('paginated() should calculate totalPages and hasNext correctly', () => {
        const data = [1, 2];
        const page = 1;
        const limit = 2;
        const total = 10;

        ResponseFormatter.paginated(mockRes, data, page, limit, total);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: data,
            pagination: {
                page: 1,
                limit: 2,
                total: 10,
                totalPages: 5,
                hasNext: true,
                hasPrev: false
            }
        }));
    });

    it('paginated() should correctly identify no next page', () => {
        const data = [1, 2];
        const page = 5;
        const limit = 2;
        const total = 10;

        ResponseFormatter.paginated(mockRes, data, page, limit, total);

        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            pagination: expect.objectContaining({
                hasNext: false,
                hasPrev: true
            } )
        }));
    });

    it('error() should default to status 500 if not provided', () => {
        ResponseFormatter.error(mockRes, 'Fatal');
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});
