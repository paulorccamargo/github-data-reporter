import { Injectable } from '@nestjs/common';
import { ReportMySQLRepository } from '../repositories/report.mysql-repository';
import { ReportResponseDto } from '../dtos/report-response.dto';
import { ListUserReportsDto } from '../dtos/list-user-reports.dto';
import { ListUserReportsResponseDto } from '../dtos/list-user-reports-response.dto';

@Injectable()
export class ListUserReportsUseCase {
    constructor(private readonly reportRepository: ReportMySQLRepository) {}

    async execute(
        listUserReportsDto: ListUserReportsDto,
    ): Promise<ListUserReportsResponseDto> {
        const { data, total } =
            await this.reportRepository.findByUserIdPaginated(
                listUserReportsDto.userId,
                listUserReportsDto.page,
                listUserReportsDto.limit,
            );

        return {
            data: data.map((report) => ReportResponseDto.fromEntity(report)),
            total,
            page: listUserReportsDto.page,
            limit: listUserReportsDto.limit,
            totalPages: Math.ceil(total / listUserReportsDto.limit),
        };
    }
}
