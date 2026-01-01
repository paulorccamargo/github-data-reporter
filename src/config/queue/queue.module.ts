import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import queueConfig from './queue.config';

@Global()
@Module({
    imports: [
        ConfigModule.forFeature(queueConfig),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get('queue.redis.host'),
                    port: configService.get('queue.redis.port'),
                    password: configService.get('queue.redis.password'),
                    db: configService.get('queue.redis.db'),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'report-generation',
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
