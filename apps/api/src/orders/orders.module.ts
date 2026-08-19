import { Controller, Get, Inject, Module, Req, UseGuards } from '@nestjs/common';
import { Pool } from 'pg';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthModule } from '../auth/auth.module';

@Controller('orders')
export class OrdersController {
  constructor(@Inject('PG_POOL') private readonly pool:Pool) {}
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async summary(@Req() req:AuthenticatedRequest){ const {rows}=await this.pool.query(`select o.id,o.status,o.amount,o.created_at,o.due_date,p.title as project_title,p.department from orders o left join project_topics p on p.id=o.topic_id where o.user_id=$1 order by o.created_at desc limit 10`,[req.user.sub]); return rows; }
}
@Module({controllers:[OrdersController],imports:[AuthModule]}) export class OrdersModule {}
