export interface GithubStats {
    user: {
        login: string;
        name: string;
        followers: number;
        public_repos: number;
    };
    repositories: Array<{
        name: string;
        stars: number;
        language: string;
    }>;
    recentActivities: Array<{
        type: string;
        repo: string;
        date: string;
    }>;
    totalCommits: number;
    commitsByRepo: Map<string, number>;
}
