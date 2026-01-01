export class Report {
    id: string;
    user_id: string;
    github_username: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    data: string;
    error_message: string;
    requested_at: Date;
    completed_at: Date;
    created_at: Date;
    updated_at: Date;
}
