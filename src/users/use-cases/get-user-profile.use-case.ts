import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

@Injectable()
export class GetUserProfileUseCase
    implements IUseCase<string, UserResponseDto>
{
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(userId: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new UserNotFoundException();
        }

        return UserResponseDto.fromEntity(user);
    }
}
