import { GithubStats } from '../../github/types/github-stats.type';

export class EmailReportTemplate {
    static generate(stats: GithubStats): string {
        const { user, repositories, recentActivities, totalCommits } = stats;

        let emailBody = `
📊 Relatório de Atividades do GitHub - ${user.name || user.login}
==========================================

👤 INFORMAÇÕES DO USUÁRIO
--------------------------
Nome: ${user.name || 'N/A'}
Username: ${user.login}
Seguidores: ${user.followers}
Repositórios Públicos: ${user.public_repos}

📁 PRINCIPAIS REPOSITÓRIOS (Top 10)
--------------------------
`;

        repositories.slice(0, 10).forEach((repo, index) => {
            emailBody += `${index + 1}. ${repo.name}
   ⭐ Stars: ${repo.stars}
   💻 Linguagem: ${repo.language || 'N/A'}
\n`;
        });

        emailBody += `
📈 COMMITS DA ÚLTIMA SEMANA
--------------------------
Total de Commits: ${totalCommits}
\n`;

        emailBody += `
🔥 ATIVIDADES RECENTES (Últimas 5)
--------------------------
`;

        recentActivities.slice(0, 5).forEach((activity, index) => {
            const date = new Date(activity.date).toLocaleDateString('pt-BR');
            emailBody += `${index + 1}. ${activity.type}
   📦 Repositório: ${activity.repo}
   📅 Data: ${date}
\n`;
        });

        emailBody += `
==========================================
Relatório gerado automaticamente
GitHub Data Reporter
`;

        return emailBody;
    }
}
