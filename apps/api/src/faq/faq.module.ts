import { Controller, Get, Inject, Module } from '@nestjs/common';
import { Pool } from 'pg';
@Controller('faqs')
class FaqController { constructor(@Inject('PG_POOL') private readonly pool:Pool) {} @Get() async list(){ const {rows}=await this.pool.query('select id, question, answer, category from faqs where is_published=true order by sort_order asc'); return rows; } }
@Module({controllers:[FaqController]}) export class FaqModule {}
