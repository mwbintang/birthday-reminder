import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './http-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockRequest = {
    url: '/test',
  };

  const mockHost = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => mockRequest,
    }),
  } as ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jest.clearAllMocks();
  });

  it('should handle HttpException', () => {
    const exception = new HttpException(
      'Forbidden',
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        path: '/test',
        message: 'Forbidden',
      }),
    );
  });

  it('should handle generic Error', () => {
    const exception = new Error('Something went wrong');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Something went wrong',
      }),
    );
  });

  it('should handle unknown exception', () => {
    filter.catch('unknown error', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});