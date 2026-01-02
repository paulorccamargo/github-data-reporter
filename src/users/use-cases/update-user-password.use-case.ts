import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UpdateUserPasswordDto } from '../dtos/update-user-password.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { InvalidOldPasswordException } from '../exceptions/invalid-old-password.exception';
import { HashUtil } from '../../common/utils/hash.util';

@Injectable()
export class UpdateUserPasswordUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(
        updateUserPasswordDto: UpdateUserPasswordDto,
    ): Promise<void> {
        const user = await this.userRepository.findById(
            updateUserPasswordDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        const isPasswordValid = await HashUtil.compare(
            updateUserPasswordDto.data.old_password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new InvalidOldPasswordException();
        }

        const hashedPassword = await HashUtil.hash(
            updateUserPasswordDto.data.new_password,
        );

        await this.userRepository.update(updateUserPasswordDto.userId, {
            password: hashedPassword,
        });
    }
}
