import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from '../repositories/report-job.mysql-repository';
import { ReportQueueProducer } from '../producers/report-queue.producer';
import { ReportStatusDto } from '../dtos/report-status.dto';
import { GetReportStatusDto } from '../dtos/get-report-status.dto';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';

@Injectable()
export class GetReportStatusUseCase {
    constructor(
        private readonly reportRepository: ReportMySQLRepository,
        private readonly reportJobRepository: ReportJobMySQLRepository,
        private readonly reportQueueProducer: ReportQueueProducer,
    ) {}

    async execute(
        getReportStatusDto: GetReportStatusDto,
    ): Promise<ReportStatusDto> {
        const report = await this.reportRepository.findById(
            getReportStatusDto.reportId,
        );

        if (!report || report.user_id !== getReportStatusDto.userId) {
            throw new ReportNotFoundException();
        }

        const reportJob = await this.reportJobRepository.findByReportId(
            getReportStatusDto.reportId,
        );

        if (!reportJob) {
            return {
                reportId: getReportStatusDto.reportId,
                status: report.status,
                message: 'Job de relatório não encontrado',
            };
        }

        const jobStatus = await this.reportQueueProducer.getJobStatus(
            reportJob.job_id,
        );

        return {
            reportId: getReportStatusDto.reportId,
            status: report.status,
            jobId: reportJob.job_id,
            jobStatus: jobStatus?.status || reportJob.status,
            progress: jobStatus?.progress || 0,
            message: report.error_message || undefined,
        };
    }
}
