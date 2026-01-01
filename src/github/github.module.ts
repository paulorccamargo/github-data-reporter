import { Module } from '@nestjs/common';
import { GithubService } from './services/github.service';
import { GithubClientService } from './services/github-client.service';
import { GithubDataMySQLRepository } from './repositories/github-data.mysql-repository';

@Module({
    providers: [GithubService, GithubClientService, GithubDataMySQLRepository],
    exports: [GithubService, GithubDataMySQLRepository],
})
export class GithubModule {}
