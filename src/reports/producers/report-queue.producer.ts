import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ReportJobData } from '../types/report-job-data.type';

@Injectable()
export class ReportQueueProducer {
    constructor(@InjectQueue('report-generation') private reportQueue: Queue) {}

    async addReportGenerationJob(data: ReportJobData): Promise<string> {
        const job = await this.reportQueue.add('generate-report', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });

        return job.id.toString();
    }

    async getJobStatus(jobId: string) {
        const job = await this.reportQueue.getJob(jobId);

        if (!job) {
            return null;
        }

        const state = await job.getState();

        return {
            id: job.id,
            status: state,
            progress: job.progress(),
            attempts: job.attemptsMade,
            data: job.data,
        };
    }

    async removeJob(jobId: string): Promise<void> {
        const job = await this.reportQueue.getJob(jobId);

        if (job) {
            await job.remove();
        }
    }
}
