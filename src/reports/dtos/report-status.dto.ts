export class ReportStatusDto {
    reportId: string;
    status: string;
    jobId?: string;
    jobStatus?: string;
    progress?: number;
    message?: string;
}
