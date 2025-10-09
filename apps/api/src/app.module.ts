import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { ImportsModule } from './modules/imports/imports.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { QueueModule } from './queue/queue.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QueueModule,
    ObservabilityModule,
    TenancyModule,
    AuthModule,
    UploadsModule,
    ReportsModule,
    ImportsModule,
    HealthModule,
    SubmissionsModule
  ]
})
export class AppModule {}
