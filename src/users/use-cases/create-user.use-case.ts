import { Injectable } from '@nestjs/common';
import { UserMySQLRepository } from '../repositories/user.mysql-repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { DuplicateEmailException } from '../exceptions/duplicate-email.exception';
import { HashUtil } from '../../../common/utils/hash.util';
import { IUseCase } from '../../../common/contracts/use-case.contract';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase
    implements IUseCase<CreateUserDto, UserResponseDto>
{
    constructor(private readonly userRepository: UserMySQLRepository) {}

    async execute(data: CreateUserDto): Promise<UserResponseDto> {
        const existingUser = await this.userRepository.findByEmail(data.email);

        if (existingUser) {
            throw new DuplicateEmailException();
        }

        const hashedPassword = await HashUtil.hash(data.password);

        const user = await this.userRepository.create({
            id: uuidv4(),
            ...data,
            password: hashedPassword,
            is_active: true,
        });

        return UserResponseDto.fromEntity(user);
    }
}
