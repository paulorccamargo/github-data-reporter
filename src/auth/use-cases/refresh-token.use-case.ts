import { Injectable } from '@nestjs/common';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { JwtTokenService } from '../services/jwt.service';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { IUseCase } from '../../../common/contracts/use-case.contract';

@Injectable()
export class RefreshTokenUseCase implements IUseCase<string, TokenResponseDto> {
    constructor(
        private readonly userRepository: UserMySQLRepository,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async execute(refreshToken: string): Promise<TokenResponseDto> {
        try {
            const payload =
                this.jwtTokenService.verifyRefreshToken(refreshToken);
            const user = await this.userRepository.findById(payload.sub);

            if (!user) {
                throw new InvalidCredentialsException();
            }

            return this.jwtTokenService.generateTokens(user.id, user.email);
        } catch {
            throw new InvalidCredentialsException();
        }
    }
}
