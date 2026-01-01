import { IRepository } from '../../../common/contracts/repository.contract';
import { User } from '../entities/user.entity';

export interface IUserRepository extends IRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findByGithubUsername(githubUsername: string): Promise<User | null>;
}
