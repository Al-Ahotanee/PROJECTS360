import { Controller, Get, Inject, Module, NotFoundException, Param, Query } from '@nestjs/common';
import { Pool } from 'pg';

@Controller('projects')
class ProjectsController {
  constructor(@Inject('PG_POOL') private readonly pool:Pool) {}
  @Get('featured')
  async featured(){ const {rows}=await this.pool.query('select id,title,department,level,price,short_description,introduction,aim_objectives,scope_limitations,methodology,icon,accent from project_topics where is_published=true order by featured desc, created_at desc limit 6'); return rows; }
  @Get(':id')
  async detail(@Param('id') id:string){ const {rows}=await this.pool.query('select id,title,department,level,price,short_description,introduction,aim_objectives,scope_limitations,methodology,icon,accent from project_topics where id=$1 and is_published=true limit 1',[id]); if(!rows[0]) throw new NotFoundException('Project topic not found'); const files=await this.pool.query('select id,file_name,file_type,file_url from project_files where topic_id=$1 order by created_at desc',[id]); return {...rows[0],files:files.rows}; }
  @Get()
  async list(@Query('search') search='',@Query('department') department='') { const q=`%${search}%`; const departmentFilter=department?' and department=$2':''; const params=department?[q,department]:[q]; const {rows}=await this.pool.query(`select id,title,department,level,price,short_description,icon,accent from project_topics where is_published=true and (title ilike $1 or department ilike $1)${departmentFilter} order by featured desc, created_at desc limit 60`,params); return rows; }
}
@Module({controllers:[ProjectsController]}) export class ProjectsModule {}
