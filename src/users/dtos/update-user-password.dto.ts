import { UpdatePasswordDto } from './update-password.dto';

export class UpdateUserPasswordDto {
    userId: string;
    data: UpdatePasswordDto;
}
