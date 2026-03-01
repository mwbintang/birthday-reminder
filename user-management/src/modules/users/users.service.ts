import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '../../database/schemas/user.schema';
import { UsersRepository } from 'src/repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async createUser(data: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    return this.usersRepository.create({
      ...data,
      birthday: new Date(data.birthday),
    });
  }

  async getAllUsers(query: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // 🔍 Search by name or email
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    if (query.sortBy) {
      sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // default newest first
    }

    const [total, users] = await Promise.all([
      this.usersRepository.count(filter),
      this.usersRepository.findAll(filter, skip, limit, sort),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    // Check if user exists first
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findByEmail(data.email);

      if (emailExists && emailExists._id.toString() !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updated = await this.usersRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}