import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportResponseDto } from '../dtos/report-response.dto';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface GetReportByIdInput {
    userId: string;
    reportId: string;
}

@Injectable()
export class GetReportByIdUseCase
    implements IUseCase<GetReportByIdInput, ReportResponseDto>
{
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(input: GetReportByIdInput): Promise<ReportResponseDto> {
        const report = await this.reportRepository.findById(input.reportId);

        if (!report || report.user_id !== input.userId) {
            throw new ReportNotFoundException();
        }

        return ReportResponseDto.fromEntity(report);
    }
}
