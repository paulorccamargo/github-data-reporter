import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UserResponseDto } from '../dtos/user-response.dto';
import { GetUserProfileDto } from '../dtos/get-user-profile.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class GetUserProfileUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(
        getUserProfileDto: GetUserProfileDto,
    ): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(
            getUserProfileDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        return UserResponseDto.fromEntity(user);
    }
}
