import { OrdersController } from './orders.module';

describe('OrdersController', () => {
  it('scopes order summaries to the verified JWT subject', async () => {
    const pool={query:jest.fn().mockResolvedValue({rows:[{id:'o1',status:'paid'}]})} as any;
    const controller=new OrdersController(pool);
    const result=await controller.summary({user:{sub:'u1',email:'a@example.com',role:'student'}} as any);
    expect(result).toEqual([{id:'o1',status:'paid'}]);
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('where o.user_id=$1'),['u1']);
  });
});
