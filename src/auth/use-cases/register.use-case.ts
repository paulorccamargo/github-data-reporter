import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { TokenResponseDto } from '../dtos/token-response.dto';
import { JwtTokenService } from '../services/jwt.service';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { DuplicateEmailException } from '../../users/exceptions/duplicate-email.exception';
import { HashUtil } from '../../common/utils/hash.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegisterUseCase {
    constructor(
        private readonly userRepository: UserMySQLRepository,
        private readonly jwtTokenService: JwtTokenService,
    ) {}

    async execute(registerDto: RegisterDto): Promise<TokenResponseDto> {
        const existingUser = await this.userRepository.findByEmail(
            registerDto.email,
        );

        if (existingUser) {
            throw new DuplicateEmailException();
        }

        const hashedPassword = await HashUtil.hash(registerDto.password);

        const user = await this.userRepository.create({
            id: uuidv4(),
            ...registerDto,
            password: hashedPassword,
            is_active: true,
        });

        return this.jwtTokenService.generateTokens(user.id, user.email);
    }
}
