import { Injectable, Inject } from '@nestjs/common';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ReportJob } from '../entities/report-job.entity';

@Injectable()
export class ReportJobMySQLRepository {
    private readonly tableName = 'report_jobs';

    constructor(@Inject('DATABASE_CONNECTION') private readonly pool: Pool) {}

    async create(data: Partial<ReportJob>): Promise<ReportJob> {
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

    async findById(id: string): Promise<ReportJob | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as ReportJob) : null;
    }

    async findOne(filters: Partial<ReportJob>): Promise<ReportJob | null> {
        const conditions = Object.keys(filters)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const values = Object.values(filters);

        const query = `SELECT * FROM ${this.tableName} WHERE ${conditions} LIMIT 1`;
        const [rows] = await this.pool.execute<RowDataPacket[]>(query, values);
        return rows.length > 0 ? (rows[0] as ReportJob) : null;
    }

    async findAll(filters?: Partial<ReportJob>): Promise<ReportJob[]> {
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
        return rows as ReportJob[];
    }

    async update(id: string, data: Partial<ReportJob>): Promise<ReportJob> {
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

    async count(filters?: Partial<ReportJob>): Promise<number> {
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

    async findByReportId(reportId: string): Promise<ReportJob | null> {
        return this.findOne({ report_id: reportId } as Partial<ReportJob>);
    }

    async findByJobId(jobId: string): Promise<ReportJob | null> {
        return this.findOne({ job_id: jobId } as Partial<ReportJob>);
    }
}
