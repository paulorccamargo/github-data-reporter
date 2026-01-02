import { Injectable } from '@nestjs/common';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { JwtTokenService } from '../services/jwt.service';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        private readonly userRepository: UserMySQLRepository,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async execute(
        refreshTokenDto: RefreshTokenDto,
    ): Promise<TokenResponseDto> {
        try {
            const payload = this.jwtTokenService.verifyRefreshToken(
                refreshTokenDto.refreshToken,
            );
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
