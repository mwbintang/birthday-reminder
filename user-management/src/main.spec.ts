import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';

describe('Main bootstrap', () => {
  const mockApp = {
    useGlobalFilters: jest.fn(),
    useGlobalInterceptors: jest.fn(),
    setGlobalPrefix: jest.fn(),
    useGlobalPipes: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(NestFactory, 'create').mockResolvedValue(
      mockApp as any,
    );

    jest
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({} as any);

    jest.spyOn(SwaggerModule, 'setup').mockImplementation();
  });

  it('should bootstrap the application', async () => {
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(mockApp.useGlobalFilters).toHaveBeenCalled();
    expect(mockApp.useGlobalInterceptors).toHaveBeenCalled();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      expect.anything(),
    );
  });
});