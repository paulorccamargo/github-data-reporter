import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UnauthorizedException } from '../../../common/exceptions/unauthorized.exception';
import { HashUtil } from '../../../common/utils/hash.util';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface UpdateUserPasswordInput {
    userId: string;
    data: UpdatePasswordDto;
}

@Injectable()
export class UpdateUserPasswordUseCase
    implements IUseCase<UpdateUserPasswordInput, void>
{
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(input: UpdateUserPasswordInput): Promise<void> {
        const user = await this.userRepository.findById(input.userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        const isPasswordValid = await HashUtil.compare(
            input.data.old_password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid old password');
        }

        const hashedPassword = await HashUtil.hash(input.data.new_password);

        await this.userRepository.update(input.userId, {
            password: hashedPassword,
        });
    }
}
