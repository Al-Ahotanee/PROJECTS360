import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { FaqModule } from './faq/faq.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({ imports:[ConfigModule.forRoot({ isGlobal:true }), AuthModule, HealthModule, ProjectsModule, WorkflowsModule, FaqModule], providers:[{ provide:'PG_POOL', inject:[ConfigService], useFactory:(config:ConfigService) => new Pool({ connectionString:config.getOrThrow<string>('DATABASE_URL'), max:5, ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized:false } : undefined }) }], exports:['PG_POOL'] })
export class AppModule {}
