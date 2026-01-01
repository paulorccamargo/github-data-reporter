import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportsController } from './controllers/reports.controller';
import { ReportGeneratorService } from './services/report-generator.service';
import { ReportMySQLRepository } from './repositories/report.mysql-repository';
import { ReportJobMySQLRepository } from './repositories/report-job.mysql-repository';
import { ReportQueueProducer } from './producers/report-queue.producer';
import { ReportGenerationProcessor } from './processors/report-generation.processor';
import { RequestReportUseCase } from './use-cases/request-report.use-case';
import { GetReportByIdUseCase } from './use-cases/get-report-by-id.use-case';
import { ListUserReportsUseCase } from './use-cases/list-user-reports.use-case';
import { GetReportStatusUseCase } from './use-cases/get-report-status.use-case';
import { DeleteReportUseCase } from './use-cases/delete-report.use-case';
import { UsersModule } from '../users/users.module';
import { GithubModule } from '../github/github.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        UsersModule,
        GithubModule,
        NotificationsModule,
        BullModule.registerQueue({
            name: 'report-generation',
        }),
    ],
    controllers: [ReportsController],
    providers: [
        ReportGeneratorService,
        ReportMySQLRepository,
        ReportJobMySQLRepository,
        ReportQueueProducer,
        ReportGenerationProcessor,
        RequestReportUseCase,
        GetReportByIdUseCase,
        ListUserReportsUseCase,
        GetReportStatusUseCase,
        DeleteReportUseCase,
    ],
})
export class ReportsModule {}
