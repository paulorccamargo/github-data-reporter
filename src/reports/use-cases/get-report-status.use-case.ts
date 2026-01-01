import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from '../repositories/report-job.mysql-repository';
import { ReportQueueProducer } from '../producers/report-queue.producer';
import { ReportStatusDto } from '../dtos/report-status.dto';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface GetReportStatusInput {
    userId: string;
    reportId: string;
}

@Injectable()
export class GetReportStatusUseCase
    implements IUseCase<GetReportStatusInput, ReportStatusDto>
{
    constructor(
        private readonly reportRepository: ReportMySQLRepository,
        private readonly reportJobRepository: ReportJobMySQLRepository,
        private readonly reportQueueProducer: ReportQueueProducer,
    ) {}

    async execute(input: GetReportStatusInput): Promise<ReportStatusDto> {
        const report = await this.reportRepository.findById(input.reportId);

        if (!report || report.user_id !== input.userId) {
            throw new ReportNotFoundException();
        }

        const reportJob = await this.reportJobRepository.findByReportId(
            input.reportId,
        );

        if (!reportJob) {
            return {
                reportId: input.reportId,
                status: report.status,
                message: 'Report job not found',
            };
        }

        const jobStatus = await this.reportQueueProducer.getJobStatus(
            reportJob.job_id,
        );

        return {
            reportId: input.reportId,
            status: report.status,
            jobId: reportJob.job_id,
            jobStatus: jobStatus?.status || reportJob.status,
            progress: jobStatus?.progress || 0,
            message: report.error_message || undefined,
        };
    }
}
