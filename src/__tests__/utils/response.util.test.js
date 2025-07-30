import { successResponse, errorResponse } from '../../utils/response.util.js';

describe('Response Utils', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Success message';
      
      const response = successResponse(data, message);
      
      expect(response).toEqual({
        success: true,
        data,
        message
      });
    });

    it('should create a success response without message', () => {
      const data = { id: 1, name: 'Test' };
      
      const response = successResponse(data);
      
      expect(response).toEqual({
        success: true,
        data,
        message: '요청에 성공했습니다.'
      });
    });
  });

  describe('errorResponse', () => {
    it('should create an error response', () => {
      const errorCode = 'TEST_ERROR';
      const errorMessage = 'Test error message';
      
      const response = errorResponse(errorCode, errorMessage);
      
      expect(response).toEqual({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage
        },
        timestamp: expect.any(String)
      });
    });

    it('should include timestamp in error response', () => {
      const response = errorResponse('TEST_ERROR', 'Test message');
      
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
}); 