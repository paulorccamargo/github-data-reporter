import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { GetCurrentUserDto } from '../dtos/get-current-user.dto';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

@Injectable()
export class GetCurrentUserUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(
        getCurrentUserDto: GetCurrentUserDto,
    ): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(
            getCurrentUserDto.userId,
        );

        if (!user) {
            throw new UserNotFoundException();
        }

        return UserResponseDto.fromEntity(user);
    }
}
