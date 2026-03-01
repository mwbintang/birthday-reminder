import { User } from "src/database/schemas/user.schema";

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}