import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { RequestReportUseCase } from '../use-cases/request-report.use-case';
import { GetReportByIdUseCase } from '../use-cases/get-report-by-id.use-case';
import { ListUserReportsUseCase } from '../use-cases/list-user-reports.use-case';
import { GetReportStatusUseCase } from '../use-cases/get-report-status.use-case';
import { DeleteReportUseCase } from '../use-cases/delete-report.use-case';
import { RequestReportDto } from '../dtos/request-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(
        private readonly requestReportUseCase: RequestReportUseCase,
        private readonly getReportByIdUseCase: GetReportByIdUseCase,
        private readonly listUserReportsUseCase: ListUserReportsUseCase,
        private readonly getReportStatusUseCase: GetReportStatusUseCase,
        private readonly deleteReportUseCase: DeleteReportUseCase,
    ) {}

    @Post('request')
    async requestReport(
        @CurrentUser() user: any,
        @Body() requestReportDto: RequestReportDto,
    ) {
        const result = await this.requestReportUseCase.execute({
            userId: user.userId,
            data: requestReportDto,
        });

        return {
            ...result,
            message: 'Geração de relatório foi enfileirada',
        };
    }

    @Get()
    async listReports(
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.listUserReportsUseCase.execute({
            userId: user.userId,
            page: Number(page),
            limit: Number(limit),
        });
    }

    @Get(':id')
    async getReport(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.getReportByIdUseCase.execute({
            userId: user.userId,
            reportId: id,
        });
    }

    @Get(':id/status')
    async getReportStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        return this.getReportStatusUseCase.execute({
            userId: user.userId,
            reportId: id,
        });
    }

    @Delete(':id')
    async deleteReport(
        @CurrentUser() user: any,
        @Param('id') id: string,
    ) {
        await this.deleteReportUseCase.execute({
            userId: user.userId,
            reportId: id,
        });

        return {
            message: 'Relatório deletado com sucesso',
        };
    }
}
