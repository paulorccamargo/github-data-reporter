import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '../../users/dtos/user-response.dto';
import { GetUserProfileUseCase } from '../../users/use-cases/get-user-profile.use-case';
import { IUseCase } from '../../../common/contracts/use-case.contract';

@Injectable()
export class GetCurrentUserUseCase
    implements IUseCase<string, UserResponseDto>
{
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
    ) {}

    async execute(userId: string): Promise<UserResponseDto> {
        return this.getUserProfileUseCase.execute(userId);
    }
}
