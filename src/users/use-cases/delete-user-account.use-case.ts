import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { DeleteUserAccountDto } from '../dtos/delete-user-account.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class DeleteUserAccountUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(deleteUserAccountDto: DeleteUserAccountDto): Promise<void> {
        const user = await this.userRepository.findById(
            deleteUserAccountDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        await this.userRepository.delete(deleteUserAccountDto.userId);
    }
}
