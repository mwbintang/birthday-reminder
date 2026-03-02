import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { UsersRepository } from '../../repositories/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { BirthdaySchedulerService } from '../birthday/birthday.service';
import { DateTime } from 'luxon';
import { UsersQuery } from './users-query.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly birthdayScheduler: BirthdaySchedulerService,
  ) {}

  async createUser(data: CreateUserDto): Promise<User> {
    const existing: User | null =
      await this.usersRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user: User = await this.usersRepository.create({
      ...data,
      birthday: new Date(data.birthday),
    });

    await this.birthdayScheduler.scheduleBirthday(user);

    return user;
  }

  async getAllUsers(query: UsersQuery): Promise<{
    data: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page: number = Number(query.page) || 1;
    const limit: number = Number(query.limit) || 10;
    const skip: number = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = {};

    if (query.sortBy) {
      sort[query.sortBy as string] =
        query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const [total, users]: [number, User[]] = await Promise.all([
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
    const user: User | null = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
  ): Promise<User> {
    const existingUser: User | null =
      await this.usersRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists: UserDocument | null =
        await this.usersRepository.findByEmail(data.email);

      if (emailExists && emailExists._id.toString() !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser: User | null =
      await this.usersRepository.update(id, data);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const birthdayChanged = this.isBirthdayChanged(
      existingUser.birthday,
      data.birthday ? new Date(data.birthday) : undefined,
    );

    const timezoneChanged =
      data.timezone &&
      data.timezone !== existingUser.timezone;

    if (birthdayChanged || timezoneChanged) {
      await this.birthdayScheduler.scheduleBirthday(updatedUser);
    }

    return updatedUser;
  }

  async deleteUser(id: string) {
    const deleted: User | null = await this.usersRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    await this.birthdayScheduler.cancelBirthday(id);
  }

  private isBirthdayChanged(
    oldBirthday: Date,
    newBirthday?: Date,
  ): boolean {
    if (!newBirthday) return false;

    const oldDate = DateTime.fromJSDate(oldBirthday).toISODate();
    const newDate = DateTime.fromJSDate(newBirthday).toISODate();

    return oldDate !== newDate;
  }
}