import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserMySQLRepository } from '../../users/repositories/user.mysql-repository';
import { JwtPayload } from '../types/jwt-payload.type';
import { UserInactiveException } from '../exceptions/user-inactive.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private userRepository: UserMySQLRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.userRepository.findById(payload.sub);

        if (!user) {
            throw new UserNotFoundException();
        }

        if (!user.is_active) {
            throw new UserInactiveException();
        }

        return { userId: user.id, email: user.email };
    }
}
