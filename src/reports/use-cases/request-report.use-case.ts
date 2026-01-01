import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from '../repositories/report-job.mysql-repository';
import { ReportQueueProducer } from '../producers/report-queue.producer';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { RequestReportDto } from '../dtos/request-report.dto';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ReportStatus, JobStatus } from '../types/report-status.enum';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface RequestReportInput {
    userId: string;
    data: RequestReportDto;
}

@Injectable()
export class RequestReportUseCase
    implements
        IUseCase<
            RequestReportInput,
            { reportId: string; jobId: string; status: string }
        >
{
    constructor(
        private readonly reportRepository: ReportMySQLRepository,
        private readonly reportJobRepository: ReportJobMySQLRepository,
        private readonly reportQueueProducer: ReportQueueProducer,
        private readonly userRepository: UserMySQLRepository,
    ) {}

    async execute(
        input: RequestReportInput,
    ): Promise<{ reportId: string; jobId: string; status: string }> {
        const user = await this.userRepository.findById(input.userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        const githubUsername =
            input.data.github_username || user.github_username;

        const reportId = uuidv4();

        await this.reportRepository.create({
            id: reportId,
            user_id: input.userId,
            github_username: githubUsername,
            status: ReportStatus.PENDING,
        });

        const jobId = await this.reportQueueProducer.addReportGenerationJob({
            reportId,
            userId: input.userId,
            githubUsername,
            githubToken: user.github_token,
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
