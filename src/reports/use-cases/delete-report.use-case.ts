import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { DeleteReportDto } from '../dtos/delete-report.dto';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';

@Injectable()
export class DeleteReportUseCase {
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(deleteReportDto: DeleteReportDto): Promise<void> {
        const report = await this.reportRepository.findById(
            deleteReportDto.reportId,
        );

        if (!report || report.user_id !== deleteReportDto.userId) {
            throw new ReportNotFoundException();
        }

        await this.reportRepository.delete(deleteReportDto.reportId);
    }
}
