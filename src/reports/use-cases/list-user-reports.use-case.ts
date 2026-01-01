import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportResponseDto } from '../dtos/report-response.dto';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface ListUserReportsInput {
    userId: string;
    page: number;
    limit: number;
}

interface ListUserReportsOutput {
    data: ReportResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class ListUserReportsUseCase
    implements IUseCase<ListUserReportsInput, ListUserReportsOutput>
{
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(input: ListUserReportsInput): Promise<ListUserReportsOutput> {
        const { data, total } =
            await this.reportRepository.findByUserIdPaginated(
                input.userId,
                input.page,
                input.limit,
            );

        return {
            data: data.map((report) => ReportResponseDto.fromEntity(report)),
            total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.ceil(total / input.limit),
        };
    }
}
