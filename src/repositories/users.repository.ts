import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schemas/user.schema';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) { }

    async create(data: Partial<User>): Promise<User> {
        return this.userModel.create(data);
    }

    async count(filter: any): Promise<number> {
        return this.userModel.countDocuments(filter);
    }

    async findAll(
        filter: any,
        skip: number,
        limit: number,
        sort: any,
    ): Promise<User[]> {
        return this.userModel
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .lean()
            .exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
    }

    async delete(id: string): Promise<User | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }
}