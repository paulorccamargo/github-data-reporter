export class ReportResponseDto {
    id: string;
    github_username: string;
    status: string;
    data: any;
    error_message: string;
    requested_at: Date;
    completed_at: Date;

    static fromEntity(report: any): ReportResponseDto {
        return {
            id: report.id,
            github_username: report.github_username,
            status: report.status,
            data: report.data ? JSON.parse(report.data) : null,
            error_message: report.error_message,
            requested_at: report.requested_at,
            completed_at: report.completed_at,
        };
    }
}
