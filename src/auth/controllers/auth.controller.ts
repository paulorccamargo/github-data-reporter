import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
} from '@nestjs/common';
import { RegisterUseCase } from '../use-cases/register.use-case';
import { LoginUseCase } from '../use-cases/login.use-case';
import { RefreshTokenUseCase } from '../use-cases/refresh-token.use-case';
import { GetCurrentUserUseCase } from '../use-cases/get-current-user.use-case';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    ) {}

    @Public()
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.registerUseCase.execute(registerDto);
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.loginUseCase.execute(loginDto);
    }

    @Public()
    @Post('refresh')
    async refresh(@Body('refresh_token') refreshToken: string) {
        return this.refreshTokenUseCase.execute({ refreshToken });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@CurrentUser() user: any) {
        return this.getCurrentUserUseCase.execute({ userId: user.userId });
    }
}
