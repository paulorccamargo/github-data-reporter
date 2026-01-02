import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';

export const databaseProvider = {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (configService: ConfigService): Promise<Pool> => {
        const pool = createPool({
            host: configService.get('database.host'),
            port: configService.get('database.port'),
            user: configService.get('database.username'),
            password: configService.get('database.password'),
            database: configService.get('database.database'),
            connectionLimit: configService.get('database.connectionLimit'),
            waitForConnections: true,
            queueLimit: 0,
        });

        try {
            const connection = await pool.getConnection();
            connection.release();
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }

        return pool;
    },
    inject: [ConfigService],
};
