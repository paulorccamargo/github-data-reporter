import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProvider } from './database.provider';
import databaseConfig from './database.config';

@Global()
@Module({
    imports: [ConfigModule.forFeature(databaseConfig)],
    providers: [databaseProvider],
    exports: [databaseProvider],
})
export class DatabaseModule {}
