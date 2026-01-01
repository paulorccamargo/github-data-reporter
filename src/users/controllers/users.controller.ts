import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    UseGuards,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from '../use-cases/update-user-password.use-case';
import { DeleteUserAccountUseCase } from '../use-cases/delete-user-account.use-case';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { DuplicateEmailException } from '../exceptions/duplicate-email.exception';
import { UnauthorizedException } from '../../../common/exceptions/unauthorized.exception';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
        private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
        private readonly deleteUserAccountUseCase: DeleteUserAccountUseCase,
    ) {}

    @Get('profile')
    async getProfile(
        @CurrentUser() user: any,
        @Res() res: Response,
    ) {
        try {
            const result = await this.getUserProfileUseCase.execute(user.userId);
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

    @Patch('profile')
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateUserDto: UpdateUserDto,
        @Res() res: Response,
    ) {
        try {
            const result = await this.updateUserProfileUseCase.execute({
                userId: user.userId,
                data: updateUserDto,
            });
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Usuário não encontrado(a)',
                });
            }
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

    @Patch('password')
    async updatePassword(
        @CurrentUser() user: any,
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Res() res: Response,
    ) {
        try {
            await this.updateUserPasswordUseCase.execute({
                userId: user.userId,
                data: updatePasswordDto,
            });
            return res.status(HttpStatus.OK).json({
                message: 'Senha atualizada com sucesso',
            });
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    message: 'Usuário não encontrado(a)',
                });
            }
            if (error instanceof UnauthorizedException) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    message: 'Senha antiga inválida',
                });
            }
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Erro interno do servidor',
            });
        }
    }

    @Delete('account')
    async deleteAccount(
        @CurrentUser() user: any,
        @Res() res: Response,
    ) {
        try {
            await this.deleteUserAccountUseCase.execute(user.userId);
            return res.status(HttpStatus.OK).json({
                message: 'Conta deletada com sucesso',
            });
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
