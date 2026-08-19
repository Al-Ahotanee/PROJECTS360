import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { FaqModule } from './faq/faq.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ProjectsModule,
    WorkflowsModule,
    FaqModule,
  ],
})
export class AppModule {}
