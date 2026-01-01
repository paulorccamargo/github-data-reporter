import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportNotFoundException } from '../exceptions/report-not-found.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface DeleteReportInput {
    userId: string;
    reportId: string;
}

@Injectable()
export class DeleteReportUseCase implements IUseCase<DeleteReportInput, void> {
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(input: DeleteReportInput): Promise<void> {
        const report = await this.reportRepository.findById(input.reportId);

        if (!report || report.user_id !== input.userId) {
            throw new ReportNotFoundException();
        }

        await this.reportRepository.delete(input.reportId);
    }
}
