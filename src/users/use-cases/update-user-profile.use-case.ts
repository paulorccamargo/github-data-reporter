import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { DuplicateEmailException } from '../exceptions/duplicate-email.exception';

@Injectable()
export class UpdateUserProfileUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(
        updateUserProfileDto: UpdateUserProfileDto,
    ): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(
            updateUserProfileDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        if (
            updateUserProfileDto.data.email &&
            updateUserProfileDto.data.email !== user.email
        ) {
            const existingUser = await this.userRepository.findByEmail(
                updateUserProfileDto.data.email,
            );

            if (existingUser) {
                throw new DuplicateEmailException();
            }
        }

        const updatedUser = await this.userRepository.update(
            updateUserProfileDto.userId,
            updateUserProfileDto.data,
        );

        return UserResponseDto.fromEntity(updatedUser);
    }
}
