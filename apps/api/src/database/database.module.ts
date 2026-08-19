import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => new Pool({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
        max: 5,
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : undefined,
      }),
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}
