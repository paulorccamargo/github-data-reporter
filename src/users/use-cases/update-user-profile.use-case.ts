import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { DuplicateEmailException } from '../exceptions/duplicate-email.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

interface UpdateUserProfileInput {
    userId: string;
    data: UpdateUserDto;
}

@Injectable()
export class UpdateUserProfileUseCase
    implements IUseCase<UpdateUserProfileInput, UserResponseDto>
{
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(input: UpdateUserProfileInput): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(input.userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        if (input.data.email && input.data.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(
                input.data.email,
            );

            if (existingUser) {
                throw new DuplicateEmailException();
            }
        }

        const updatedUser = await this.userRepository.update(
            input.userId,
            input.data,
        );

        return UserResponseDto.fromEntity(updatedUser);
    }
}
