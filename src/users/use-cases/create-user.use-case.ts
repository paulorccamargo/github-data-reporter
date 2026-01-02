import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { DuplicateEmailException } from '../exceptions/duplicate-email.exception';
import { HashUtil } from '../../common/utils/hash.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.userRepository.findByEmail(
            createUserDto.email,
        );

        if (existingUser) {
            throw new DuplicateEmailException();
        }

        const hashedPassword = await HashUtil.hash(createUserDto.password);

        const user = await this.userRepository.create({
            id: uuidv4(),
            ...createUserDto,
            password: hashedPassword,
            is_active: true,
        });

        return UserResponseDto.fromEntity(user);
    }
}
