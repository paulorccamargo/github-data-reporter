import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportResponseDto } from '../dtos/report-response.dto';
import { GetReportByIdDto } from '../dtos/get-report-by-id.dto';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';

@Injectable()
export class GetReportByIdUseCase {
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(
        getReportByIdDto: GetReportByIdDto,
    ): Promise<ReportResponseDto> {
        const report = await this.reportRepository.findById(
            getReportByIdDto.reportId,
        );

        if (!report || report.user_id !== getReportByIdDto.userId) {
            throw new ReportNotFoundException();
        }

        return ReportResponseDto.fromEntity(report);
    }
}
