import { Controller, Get, Inject, Module } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('health')
class HealthController {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}
  @Get()
  async check() { const result = await this.pool.query('select now() as time'); return { status:'ok', service:'projects360-api', database:'connected', time:result.rows[0].time }; }
}
@Module({ controllers:[HealthController] }) export class HealthModule {}
