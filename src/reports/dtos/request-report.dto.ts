import { IsOptional, IsString } from 'class-validator';

export class RequestReportDto {
    @IsString()
    @IsOptional()
    github_username?: string;
}
