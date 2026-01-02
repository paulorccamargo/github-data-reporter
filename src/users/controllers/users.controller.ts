import {
    Controller,
    Get,
    Patch,
    Delete,
    Body,
    UseGuards,
} from '@nestjs/common';
import { GetUserProfileUseCase } from '../use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from '../use-cases/update-user-password.use-case';
import { DeleteUserAccountUseCase } from '../use-cases/delete-user-account.use-case';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
    async getProfile(@CurrentUser() user: any) {
        return this.getUserProfileUseCase.execute({ userId: user.userId });
    }

    @Patch('profile')
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.updateUserProfileUseCase.execute({
            userId: user.userId,
            data: updateUserDto,
        });
    }

    @Patch('password')
    async updatePassword(
        @CurrentUser() user: any,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        await this.updateUserPasswordUseCase.execute({
            userId: user.userId,
            data: updatePasswordDto,
        });

        return {
            message: 'Senha atualizada com sucesso',
        };
    }

    @Delete('account')
    async deleteAccount(@CurrentUser() user: any) {
        await this.deleteUserAccountUseCase.execute({ userId: user.userId });

        return {
            message: 'Conta deletada com sucesso',
        };
    }
}
