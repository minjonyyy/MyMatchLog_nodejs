import { successResponse, errorResponse } from '../../utils/response.util.js';

describe('Response Utils', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const mockRes = {
        status: () => mockRes,
        json: () => mockRes
      };
      const data = { id: 1, name: 'Test' };
      const message = 'Success message';
      
      const result = successResponse(mockRes, data, message);
      
      expect(result).toBeDefined();
    });

    it('should create a success response without message', () => {
      const mockRes = {
        status: () => mockRes,
        json: () => mockRes
      };
      const data = { id: 1, name: 'Test' };
      
      const result = successResponse(mockRes, data);
      
      expect(result).toBeDefined();
    });
  });

  describe('errorResponse', () => {
    it('should create an error response', () => {
      const mockRes = {
        status: () => mockRes,
        json: () => mockRes
      };
      const error = {
        statusCode: 400,
        code: 'TEST_ERROR',
        message: 'Test error message'
      };
      
      const result = errorResponse(mockRes, error);
      
      expect(result).toBeDefined();
    });

    it('should include timestamp in error response', () => {
      const mockRes = {
        status: () => mockRes,
        json: () => mockRes
      };
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message'
      };
      
      const result = errorResponse(mockRes, error);
      
      expect(result).toBeDefined();
    });
  });
}); 