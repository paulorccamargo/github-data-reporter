import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { JwtTokenService } from '../services/jwt.service';
import { CreateUserUseCase } from '../../users/use-cases/create-user.use-case';
import { IUseCase } from '../../../common/contracts/use-case.contract';

@Injectable()
export class RegisterUseCase
    implements IUseCase<RegisterDto, TokenResponseDto>
{
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async execute(data: RegisterDto): Promise<TokenResponseDto> {
        const user = await this.createUserUseCase.execute(data);

        return this.jwtTokenService.generateTokens(user.id, user.email);
    }
}
