import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from '../repositories/report-job.mysql-repository';
import { ReportQueueProducer } from '../producers/report-queue.producer';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { RequestReportCommandDto } from '../dtos/request-report-command.dto';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ReportStatus, JobStatus } from '../types/report-status.enum';
import { DailyLimitExceededException } from '../exceptions/daily-limit-exceeded.exception';

@Injectable()
export class RequestReportUseCase {
    constructor(
        private readonly reportRepository: ReportMySQLRepository,
        private readonly reportJobRepository: ReportJobMySQLRepository,
        private readonly reportQueueProducer: ReportQueueProducer,
        private readonly userRepository: UserMySQLRepository,
    ) {}

    async execute(
        requestReportCommandDto: RequestReportCommandDto,
    ): Promise<{ reportId: string; jobId: string; status: string }> {
        const user = await this.userRepository.findById(
            requestReportCommandDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        const todayReportsCount =
            await this.reportRepository.countTodayReportsByUserId(
                requestReportCommandDto.userId,
            );

        if (todayReportsCount >= 3) {
            throw new DailyLimitExceededException();
        }

        const githubUsername =
            requestReportCommandDto.data.github_username || user.github_username;

        const reportId = uuidv4();

        await this.reportRepository.create({
            id: reportId,
            user_id: requestReportCommandDto.userId,
            github_username: githubUsername,
            status: ReportStatus.PENDING,
        });

        const jobId = await this.reportQueueProducer.addReportGenerationJob({
            reportId,
            userId: requestReportCommandDto.userId,
            githubUsername,
            userEmail: user.email,
        });

        await this.reportJobRepository.create({
            id: uuidv4(),
            report_id: reportId,
            job_id: jobId,
            status: JobStatus.WAITING,
            attempts: 0,
            max_attempts: 3,
        });

        return {
            reportId,
            jobId,
            status: 'queued',
        };
    }
}
