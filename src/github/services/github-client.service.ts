import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { GithubApiException } from '../exceptions/github-api.exception';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { RateLimitException } from '../exceptions/rate-limit.exception';

@Injectable()
export class GithubClientService {
    private readonly apiUrl: string;
    private readonly axiosInstance: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.apiUrl = this.configService.get(
            'GITHUB_API_URL',
            'https://api.github.com',
        );
        this.axiosInstance = axios.create({
            baseURL: this.apiUrl,
            headers: {
                Accept: 'application/vnd.github.v3+json',
            },
        });
    }

    private getHeaders(token?: string) {
        const headers: any = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (token) {
            headers.Authorization = `token ${token}`;
        }

        return headers;
    }

    async get<T>(url: string, token?: string): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url, {
                headers: this.getHeaders(token),
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                throw new InvalidTokenException();
            }

            if (
                status === 403 &&
                error.response.headers['x-ratelimit-remaining'] === '0'
            ) {
                throw new RateLimitException();
            }

            if (status === 404) {
                throw new GithubApiException('GitHub resource not found');
            }

            throw new GithubApiException(
                error.response.data?.message || 'GitHub API error',
            );
        }

        throw new GithubApiException('Failed to connect to GitHub API');
    }
}
