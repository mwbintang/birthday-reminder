import { ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('should wrap response data', (done) => {
    const mockResponse = {
      statusCode: 201,
    };

    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockNext: CallHandler = {
      handle: () => of({ name: 'Bintang' }),
    };

    interceptor.intercept(mockContext, mockNext).subscribe((result) => {
      expect(result).toEqual(
        expect.objectContaining({
          statusCode: 201,
          message: 'Success',
          data: { name: 'Bintang' },
          timestamp: expect.any(String),
        }),
      );
      done();
    });
  });

  it('should default to 200 if statusCode not set', (done) => {
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({}),
      }),
    } as ExecutionContext;

    const mockNext: CallHandler = {
      handle: () => of('ok'),
    };

    interceptor.intercept(mockContext, mockNext).subscribe((result) => {
      expect(result.statusCode).toBe(HttpStatus.OK);
      done();
    });
  });
});