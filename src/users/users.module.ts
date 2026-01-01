import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserMySQLRepository } from './repositories/user.mysql-repository';
import { GetUserProfileUseCase } from './use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from './use-cases/update-user-password.use-case';
import { DeleteUserAccountUseCase } from './use-cases/delete-user-account.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';

@Module({
    controllers: [UsersController],
    providers: [
        UserMySQLRepository,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        UpdateUserPasswordUseCase,
        DeleteUserAccountUseCase,
        CreateUserUseCase,
    ],
    exports: [UserMySQLRepository, GetUserProfileUseCase, CreateUserUseCase],
})
export class UsersModule {}
