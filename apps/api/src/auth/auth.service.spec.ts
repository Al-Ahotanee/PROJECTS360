import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.module';

describe('AuthService', () => {
  const pool = { query: jest.fn() } as any;
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed-token') } as unknown as JwtService;
  let service: AuthService;
  beforeEach(() => { pool.query.mockReset(); service = new AuthService(pool, jwt); });

  it('logs in with a valid password and returns a JWT', async () => {
    const hash = await bcrypt.hash('secret123', 4);
    pool.query.mockResolvedValue({ rows:[{id:'u1',email:'a@example.com',full_name:'Alex',role:'student',password_hash:hash}] });
    await expect(service.login({email:'a@example.com',password:'secret123'})).resolves.toMatchObject({access_token:'signed-token',user:{id:'u1'}});
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('from users'), ['a@example.com']);
  });

  it('rejects invalid credentials', async () => { pool.query.mockResolvedValue({rows:[]}); await expect(service.login({email:'a@example.com',password:'badpass'})).rejects.toBeInstanceOf(UnauthorizedException); });

  it('creates an account and hashes the password', async () => { pool.query.mockResolvedValue({rows:[{id:'u2',email:'new@example.com',full_name:'New User',role:'student'}]}); const result=await service.signup({email:'new@example.com',password:'secret123',full_name:'New User'}); expect(result).toMatchObject({access_token:'signed-token',user:{id:'u2'}}); const values=pool.query.mock.calls[0][1]; expect(values[0]).toBe('new@example.com'); expect(values[1]).not.toBe('secret123'); expect(await bcrypt.compare('secret123',values[1])).toBe(true); });

  it('maps duplicate emails to a conflict response', async () => { pool.query.mockRejectedValue({code:'23505'}); await expect(service.signup({email:'a@example.com',password:'secret123',full_name:'Alex'})).rejects.toBeInstanceOf(ConflictException); });

  it('returns the authenticated profile', async () => { pool.query.mockResolvedValue({rows:[{id:'u1',email:'a@example.com',full_name:'Alex',role:'student'}]}); await expect(service.me('u1')).resolves.toMatchObject({id:'u1',email:'a@example.com'}); });
});
