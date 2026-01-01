export class UserResponseDto {
    id: string;
    email: string;
    github_username: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;

    static fromEntity(user: any): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            github_username: user.github_username,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }
}
