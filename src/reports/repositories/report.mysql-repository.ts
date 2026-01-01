import { Injectable, Inject } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportMySQLRepository {
    private readonly tableName = 'reports';

    constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {}

    async create(data: Partial<Report>): Promise<Report> {
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

    async findById(id: string): Promise<Report | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as Report) : null;
    }

    async findOne(filters: Partial<Report>): Promise<Report | null> {
        const conditions = Object.keys(filters)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const values = Object.values(filters);

        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions} LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, values);
        return rows.length > 0 ? (rows[0] as Report) : null;
    }

    async findAll(filters?: Partial<Report>): Promise<Report[]> {
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
        return rows as Report[];
    }

    async update(id: string, data: Partial<Report>): Promise<Report> {
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

    async count(filters?: Partial<Report>): Promise<number> {
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

    async findByUserId(userId: string): Promise<Report[]> {
        return this.findAll({ user_id: userId } as Partial<Report>);
    }

    async findByUserIdPaginated(
        userId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{ data: Report[]; total: number }> {
        const offset = (page - 1) * limit;

        const query = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = ?
      ORDER BY requested_at DESC
      LIMIT ? OFFSET ?
    `;

        const countQuery = `
      SELECT COUNT(*) as count FROM ${this.tableName}
      WHERE user_id = ?
    `;

        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [
            userId,
            limit,
            offset,
        ]);
        const [countResult] = await this.pool.execute<RowDataPacket[]>(
            countQuery,
            [userId],
        );

        return {
            data: rows as Report[],
            total: countResult[0].count,
        };
    }
}
