import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
    },
    reportQueue: {
        name: process.env.QUEUE_REPORT_NAME || 'report-generation',
        concurrency: parseInt(process.env.QUEUE_REPORT_CONCURRENCY, 10) || 5,
        maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS, 10) || 3,
    },
}));
