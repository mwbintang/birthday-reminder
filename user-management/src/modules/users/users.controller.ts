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
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@Controller('v1/users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.createUser(body);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of users returned successfully.' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: keyof User,
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
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User returned successfully.', type: User })
  async findById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User updated successfully.', type: User })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}