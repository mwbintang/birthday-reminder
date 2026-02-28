import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.createUser(body);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.usersService.getAllUsers({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<User>,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}