import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

@Injectable()
export class DeleteUserAccountUseCase implements IUseCase<string, void> {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        await this.userRepository.delete(userId);
    }
}
