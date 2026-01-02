import { ReportResponseDto } from './report-response.dto';

export class ListUserReportsResponseDto {
    data: ReportResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
