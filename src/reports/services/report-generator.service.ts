import { Injectable } from '@nestjs/common';
import { GithubStats } from '../../github/types/github-stats.type';
import { EmailReportTemplate } from '../templates/email-report.template';

@Injectable()
export class ReportGeneratorService {
    generateEmailContent(stats: GithubStats): string {
        return EmailReportTemplate.generate(stats);
    }

    generateEmailSubject(githubUsername: string): string {
        return `📊 Relatório de Atividades do GitHub - ${githubUsername}`;
    }
}
