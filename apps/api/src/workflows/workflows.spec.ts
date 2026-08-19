import { NotFoundException } from '@nestjs/common';
import { WorkflowOrdersController, ServicesController } from './workflows.module';

describe('workflow controllers',()=>{
  it('creates an order and records the initial event',async()=>{
    const client={query:jest.fn().mockResolvedValue({rows:[{id:'o1',status:'awaiting_brief',amount:28000}]}),release:jest.fn()};
    const pool={query:jest.fn().mockResolvedValueOnce({rows:[{id:'p1',title:'Campus App',price:28000}]}),connect:jest.fn().mockResolvedValue(client)} as any;
    const controller=new WorkflowOrdersController(pool);
    await expect(controller.create({user:{sub:'u1'} } as any,{topic_id:'p1',brief:'Need a clear scope for my final year delivery.'} as any)).resolves.toMatchObject({id:'o1'});
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('insert into order_events'),expect.any(Array));
    expect(client.query).toHaveBeenCalledWith('commit');
  });
  it('does not expose an order outside the authenticated user scope',async()=>{ const pool={query:jest.fn().mockResolvedValue({rows:[]})} as any; const controller=new WorkflowOrdersController(pool); await expect(controller.detail({user:{sub:'u1'}} as any,'o2')).rejects.toBeInstanceOf(NotFoundException); });
  it('persists a custom service request for the authenticated user',async()=>{ const pool={query:jest.fn().mockResolvedValue({rows:[{id:'s1',status:'submitted'}]})} as any; const controller=new ServicesController(pool); await expect(controller.create({user:{sub:'u1'}} as any,{service_type:'documentation',title:'Research chapter',description:'I need help structuring my methodology chapter.',budget:12000} as any)).resolves.toMatchObject({id:'s1'}); expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('insert into service_requests'),expect.any(Array)); });
});
