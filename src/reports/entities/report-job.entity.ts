export class ReportJob {
    id: string;
    report_id: string;
    job_id: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
    attempts: number;
    max_attempts: number;
    error: string;
    created_at: Date;
    updated_at: Date;
}
