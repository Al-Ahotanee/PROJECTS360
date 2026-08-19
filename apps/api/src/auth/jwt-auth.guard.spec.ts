import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('rejects requests without a bearer token', async () => { const jwt={verifyAsync:jest.fn()}; const guard=new JwtAuthGuard(jwt as any); const request:any={headers:{}}; const context={switchToHttp:()=>({getRequest:()=>request})} as unknown as ExecutionContext; await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException); });
  it('hydrates the request user from a valid token', async () => { const jwt={verifyAsync:jest.fn().mockResolvedValue({sub:'u1',email:'a@example.com',role:'student'})}; const guard=new JwtAuthGuard(jwt as any); const request:any={headers:{authorization:'Bearer token'}}; const context={switchToHttp:()=>({getRequest:()=>request})} as unknown as ExecutionContext; await expect(guard.canActivate(context)).resolves.toBe(true); expect(request.user.sub).toBe('u1'); });
});
