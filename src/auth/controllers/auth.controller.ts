import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { GetCurrentUserUseCase } from '../use-cases/get-current-user.use-case';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { DuplicateEmailException } from '../../users/exceptions/duplicate-email.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    ) { }

    @Public()
    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Res() res: Response,
    ) {
        try {
            const result = await this.registerUseCase.execute(registerDto);
            return res.status(HttpStatus.CREATED).json(result);
        } catch (error) {
            if (error instanceof DuplicateEmailException) {
                return res.status(HttpStatus.CONFLICT).json({
                    message: 'Email já está em uso',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Public()
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res() res: Response,
    ) {
        try {
            const result = await this.loginUseCase.execute(loginDto);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (
                error instanceof UserNotFoundException ||
                error instanceof InvalidCredentialsException
            ) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Credenciais inválidas',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Public()
    @Post('refresh')
    async refresh(
        @Body('refresh_token') refreshToken: string,
        @Res() res: Response,
    ) {
        try {
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof InvalidCredentialsException) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Token de atualização inválido',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    public async getCurrentUser(
        @CurrentUser() user: any,
        @Res() res: Response,
    ) {
        try {
            const result = 
                await this.getCurrentUserUseCase.execute(user.userId);
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Usuário não encontrado(a)',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }
}
