import { Injectable } from '@nestjs/common';
import { GithubClientService } from './github-client.service';
import { GithubUserDataDto } from '../dtos/github-user-data.dto';
import { GithubRepositoryDto } from '../dtos/github-repository.dto';
import { GithubEventDto } from '../dtos/github-event.dto';
import { GithubCommitDto } from '../dtos/github-commit.dto';
import { GithubStats } from '../types/github-stats.type';

@Injectable()
export class GithubService {
    constructor(private readonly githubClient: GithubClientService) {}

    async fetchUserData(
        username: string,
        token?: string,
    ): Promise<GithubUserDataDto> {
        return this.githubClient.get<GithubUserDataDto>(
            `/users/${username}`,
            token,
        );
    }

    async fetchRepositories(
        username: string,
        token?: string,
    ): Promise<GithubRepositoryDto[]> {
        return this.githubClient.get<GithubRepositoryDto[]>(
            `/users/${username}/repos?sort=updated&per_page=100`,
            token,
        );
    }

    async fetchUserEvents(
        username: string,
        token?: string,
    ): Promise<GithubEventDto[]> {
        return this.githubClient.get<GithubEventDto[]>(
            `/users/${username}/events?per_page=100`,
            token,
        );
    }

    async fetchCommits(
        username: string,
        repo: string,
        since: Date,
        token?: string,
    ): Promise<GithubCommitDto[]> {
        const sinceParam = since.toISOString();
        return this.githubClient.get<GithubCommitDto[]>(
            `/repos/${username}/${repo}/commits?since=${sinceParam}&per_page=100`,
            token,
        );
    }

    async fetchAllCommitsLastWeek(
        username: string,
        repositories: GithubRepositoryDto[],
        token?: string,
    ): Promise<{ total: number; byRepo: Map<string, number> }> {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const commitsByRepo = new Map<string, number>();
        let total = 0;

        for (const repo of repositories) {
            try {
                const commits = await this.fetchCommits(
                    username,
                    repo.name,
                    oneWeekAgo,
                    token,
                );

                const userCommits = commits.filter(
                    (commit) =>
                        commit.commit.author.name
                            .toLowerCase()
                            .includes(username.toLowerCase()) ||
                        commit.commit.author.email
                            .toLowerCase()
                            .includes(username.toLowerCase()),
                );

                commitsByRepo.set(repo.name, userCommits.length);
                total += userCommits.length;
            } catch {
                commitsByRepo.set(repo.name, 0);
            }
        }

        return { total, byRepo: commitsByRepo };
    }

    async getGithubStats(
        username: string,
        token?: string,
    ): Promise<GithubStats> {
        const [userData, repositories, events] = await Promise.all([
            this.fetchUserData(username, token),
            this.fetchRepositories(username, token),
            this.fetchUserEvents(username, token),
        ]);

        const commits = await this.fetchAllCommitsLastWeek(
            username,
            repositories,
            token,
        );

        const recentActivities = events.slice(0, 10).map((event) => ({
            type: event.type,
            repo: event.repo.name,
            date: event.created_at,
        }));

        return {
            user: {
                login: userData.login,
                name: userData.name,
                followers: userData.followers,
                public_repos: userData.public_repos,
            },
            repositories: repositories.slice(0, 20).map((repo) => ({
                name: repo.name,
                stars: repo.stargazers_count,
                language: repo.language,
            })),
            recentActivities,
            totalCommits: commits.total,
            commitsByRepo: commits.byRepo,
        };
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            await this.githubClient.get('/user', token);
            return true;
        } catch {
            return false;
        }
    }
}
