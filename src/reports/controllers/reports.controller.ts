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
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestReportUseCase } from '../use-cases/request-report.use-case';
import { GetReportByIdUseCase } from '../use-cases/get-report-by-id.use-case';
import { ListUserReportsUseCase } from '../use-cases/list-user-reports.use-case';
import { GetReportStatusUseCase } from '../use-cases/get-report-status.use-case';
import { DeleteReportUseCase } from '../use-cases/delete-report.use-case';
import { RequestReportDto } from '../dtos/request-report.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

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
        @Res() res: Response,
    ) {
        try {
            const result = await this.requestReportUseCase.execute({
                userId: user.userId,
                data: requestReportDto,
            });

            return res.status(HttpStatus.CREATED).json({
                ...result,
                message: 'Geração de relatório foi enfileirada',
            });
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Usuário não encontrado(a)',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Get()
    async listReports(
        @CurrentUser() user: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Res() res: Response,
    ) {
        try {
            const result = await this.listUserReportsUseCase.execute({
                userId: user.userId,
                page: Number(page),
                limit: Number(limit),
            });
            return res.status(HttpStatus.OK).json(result);
        } catch {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Get(':id')
    async getReport(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        try {
            const result = await this.getReportByIdUseCase.execute({
                userId: user.userId,
                reportId: id,
            });
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof ReportNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Relatório não encontrado(a)',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Get(':id/status')
    async getReportStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        try {
            const result = await this.getReportStatusUseCase.execute({
                userId: user.userId,
                reportId: id,
            });
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof ReportNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Relatório não encontrado(a)',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Delete(':id')
    async deleteReport(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        try {
            await this.deleteReportUseCase.execute({
                userId: user.userId,
                reportId: id,
            });
            return res.status(HttpStatus.OK).json({
                message: 'Relatório deletado com sucesso',
            });
        } catch (error) {
            if (error instanceof ReportNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Relatório não encontrado(a)',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }
}
