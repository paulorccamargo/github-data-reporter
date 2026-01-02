import { Injectable, Inject } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../contracts/user-repository.contract';

@Injectable()
export class UserMySQLRepository implements IUserRepository {
    private readonly tableName = 'users';

    constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {}

    async create(data: Partial<User>): Promise<User> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        const [result] = await this.pool.execute<ResultSetHeader>(
            query,
            values,
        );

        const insertedId = data['id'] || result.insertId.toString();
        return this.findById(insertedId);
    }

    async findById(id: string): Promise<User | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as User) : null;
    }

    async findOne(filters: Partial<User>): Promise<User | null> {
        const conditions = Object.keys(filters)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const values = Object.values(filters);

        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions} LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, values);
        return rows.length > 0 ? (rows[0] as User) : null;
    }

    async findAll(filters?: Partial<User>): Promise<User[]> {
        let query = `SELECT * FROM ${this.tableName}`;
        const values: any[] = [];

        if (filters && Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters)
                .map((key) => `${key} = ?`)
                .join(' AND ');
            values.push(...Object.values(filters));
            query += ` WHERE ${conditions}`;
        }

        const [rows] = await this.pool.execute<RowDataPacket[]>(query, values);
        return rows as User[];
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
        await this.pool.execute<ResultSetHeader>(query, [...values, id]);

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const [result] = await this.pool.execute<ResultSetHeader>(query, [id]);
        return result.affectedRows > 0;
    }

    async count(filters?: Partial<User>): Promise<number> {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const values: any[] = [];

        if (filters && Object.keys(filters).length > 0) {
            const conditions = Object.keys(filters)
                .map((key) => `${key} = ?`)
                .join(' AND ');
            values.push(...Object.values(filters));
            query += ` WHERE ${conditions}`;
        }

        const [rows] = await this.pool.execute<RowDataPacket[]>(query, values);
        return rows[0].count;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ email } as Partial<User>);
    }

    async findByGithubUsername(githubUsername: string): Promise<User | null> {
        return this.findOne({
            github_username: githubUsername,
        } as Partial<User>);
    }

    async executeQuery<R = any>(query: string, params?: any[]): Promise<R> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            query,
            params || [],
        );
        return rows as R;
    }
}
