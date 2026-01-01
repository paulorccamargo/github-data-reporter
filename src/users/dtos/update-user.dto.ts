import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    github_username?: string;

    @IsString()
    @IsOptional()
    github_token?: string;
}
