import {
    Processor,
    Process,
    OnQueueActive,
    OnQueueCompleted,
    OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GithubService } from '../../github/services/github.service';
import { GithubDataMySQLRepository } from '../../github/repositories/github-data.mysql-repository';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from '../repositories/report-job.mysql-repository';
import { ReportGeneratorService } from '../services/report-generator.service';
import { EmailService } from '../../notifications/services/email.service';
import { ReportJobData } from '../types/report-job-data.type';
import { ReportStatus, JobStatus } from '../types/report-status.enum';

@Processor('report-generation')
export class ReportGenerationProcessor {
    private readonly logger = new Logger(ReportGenerationProcessor.name);

    constructor(
        private readonly githubService: GithubService,
        private readonly githubDataRepository: GithubDataMySQLRepository,
        private readonly reportRepository: ReportMySQLRepository,
        private readonly reportJobRepository: ReportJobMySQLRepository,
        private readonly reportGeneratorService: ReportGeneratorService,
        private readonly emailService: EmailService,
    ) {}

    @Process('generate-report')
    async handleReportGeneration(job: Job<ReportJobData>) {
        const { reportId, userId, githubUsername, githubToken } = job.data;

        this.logger.log(`Starting report generation for report: ${reportId}`);

        try {
            await this.reportRepository.update(reportId, {
                status: ReportStatus.PROCESSING,
            });

            const reportJob =
                await this.reportJobRepository.findByReportId(reportId);
            if (reportJob) {
                await this.reportJobRepository.update(reportJob.id, {
                    status: JobStatus.ACTIVE,
                });
            }

            job.progress(20);
            this.logger.log(`Fetching GitHub stats for ${githubUsername}`);
            const stats = await this.githubService.getGithubStats(
                githubUsername,
                githubToken,
            );

            job.progress(60);
            this.logger.log(`Saving GitHub data to database`);
            const githubData = await this.githubDataRepository.create({
                id: uuidv4(),
                report_id: reportId,
                user_id: userId,
                github_username: githubUsername,
                followers_count: stats.user.followers,
                public_repos_count: stats.user.public_repos,
                commits_count: stats.totalCommits,
                repositories: JSON.stringify(stats.repositories),
                recent_activities: JSON.stringify(stats.recentActivities),
                raw_data: JSON.stringify(stats),
            });

            job.progress(80);
            this.logger.log(`Generating email content`);
            const emailContent =
                this.reportGeneratorService.generateEmailContent(stats);
            const emailSubject =
                this.reportGeneratorService.generateEmailSubject(
                    githubUsername,
                );

            job.progress(85);
            this.logger.log(`Sending email to ${job.data.userEmail}`);
            await this.emailService.sendReportEmail(
                job.data.userEmail,
                emailSubject,
                emailContent,
            );

            job.progress(90);
            this.logger.log(`Updating report status to completed`);
            await this.reportRepository.update(reportId, {
                status: ReportStatus.COMPLETED,
                data: JSON.stringify(githubData),
                completed_at: new Date(),
            });

            if (reportJob) {
                await this.reportJobRepository.update(reportJob.id, {
                    status: JobStatus.COMPLETED,
                });
            }

            job.progress(100);
            this.logger.log(
                `Report generation completed for report: ${reportId}`,
            );

            return {
                reportId,
                status: ReportStatus.COMPLETED,
                emailSent: true,
            };
        } catch (error) {
            this.logger.error(
                `Report generation failed for report: ${reportId}`,
                error.stack,
            );

            await this.reportRepository.update(reportId, {
                status: ReportStatus.FAILED,
                error_message: error.message,
            });

            const reportJob =
                await this.reportJobRepository.findByReportId(reportId);
            if (reportJob) {
                await this.reportJobRepository.update(reportJob.id, {
                    status: JobStatus.FAILED,
                    error: error.message,
                    attempts: reportJob.attempts + 1,
                });
            }

            throw error;
        }
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    }

    @OnQueueCompleted()
    onComplete(job: Job, result: any) {
        this.logger.debug(
            `Completed job ${job.id} - Report: ${result.reportId}`,
        );
    }

    @OnQueueFailed()
    onError(job: Job, error: any) {
        this.logger.error(
            `Failed job ${job.id} of type ${job.name}: ${error.message}`,
            error.stack,
        );
    }
}
