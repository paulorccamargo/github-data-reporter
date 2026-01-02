import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { JwtTokenService } from '../services/jwt.service';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { HashUtil } from '../../common/utils/hash.util';

@Injectable()
export class LoginUseCase {
    constructor(
        private readonly userRepository: UserMySQLRepository,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async execute(loginDto: LoginDto): Promise<TokenResponseDto> {
        const user = await this.userRepository.findByEmail(loginDto.email);

        if (!user) {
            throw new UserNotFoundException();
        }

        const isPasswordValid = await HashUtil.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new InvalidCredentialsException();
        }

        if (!user.is_active) {
            throw new InvalidCredentialsException();
        }

        return this.jwtTokenService.generateTokens(user.id, user.email);
    }
}
