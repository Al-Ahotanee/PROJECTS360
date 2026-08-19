import { Body, Controller, Get, Injectable, Module, Post, Req, UnauthorizedException, ConflictException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt-auth.guard';

export class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; }
export class SignupDto { @IsEmail() email!: string; @IsString() @MinLength(6) password!: string; @IsString() @MinLength(2) full_name!: string; }

@Injectable()
export class AuthService {
  constructor(@Inject('PG_POOL') private readonly pool:Pool, private readonly jwt:JwtService) {}
  private token(user:{id:string;email:string;full_name:string;role:string}) { return this.jwt.signAsync({ sub:user.id, email:user.email, role:user.role }); }
  private result(user:{id:string;email:string;full_name:string;role:string}) { return { id:user.id, email:user.email, full_name:user.full_name, role:user.role }; }
  async login(dto:LoginDto) { const { rows } = await this.pool.query('select id, email, full_name, role, password_hash from users where lower(email)=lower($1) limit 1',[dto.email]); const user=rows[0]; if(!user || !(await bcrypt.compare(dto.password,user.password_hash))) throw new UnauthorizedException('Invalid email or password'); return { access_token:await this.token(user), user:this.result(user) }; }
  async signup(dto:SignupDto) { const hash=await bcrypt.hash(dto.password,12); try { const { rows }=await this.pool.query('insert into users(email,password_hash,full_name) values(lower($1),$2,$3) returning id,email,full_name,role',[dto.email,hash,dto.full_name]); const user=rows[0]; return { access_token:await this.token(user), user:this.result(user) }; } catch (error:any) { if(error?.code==='23505') throw new ConflictException('An account with this email already exists'); throw error; } }
  async me(userId:string) { const { rows }=await this.pool.query('select id,email,full_name,role,phone,university,department,referral_code from users where id=$1 limit 1',[userId]); if(!rows[0]) throw new UnauthorizedException('User no longer exists'); return rows[0]; }
}

@Controller('auth')
export class AuthController { constructor(private readonly auth:AuthService) {} @Post('login') login(@Body() dto:LoginDto){ return this.auth.login(dto); } @Post('signup') signup(@Body() dto:SignupDto){ return this.auth.signup(dto); } @Get('me') @UseGuards(JwtAuthGuard) me(@Req() req:AuthenticatedRequest){ return this.auth.me(req.user.sub); } }

@Module({ imports:[JwtModule.registerAsync({ inject:[ConfigService], useFactory:(config:ConfigService)=>({ secret:config.getOrThrow<string>('JWT_SECRET'), signOptions:{ expiresIn:'7d' } }) })], controllers:[AuthController], providers:[AuthService,JwtAuthGuard], exports:[AuthService,JwtAuthGuard,JwtModule] }) export class AuthModule {}
