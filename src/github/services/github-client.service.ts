import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { GithubApiException } from '../exceptions/github-api.exception';
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

    private getHeaders() {
        return {
            Accept: 'application/vnd.github.v3+json',
        };
    }

    async get<T>(url: string): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url, {
                headers: this.getHeaders(),
            });

            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        if (error.response) {
            const status = error.response.status;

            if (
                status === 403 &&
                error.response.headers['x-ratelimit-remaining'] === '0'
            ) {
                throw new RateLimitException();
            }

            throw new GithubApiException();
        }

        throw new GithubApiException();
    }
}
