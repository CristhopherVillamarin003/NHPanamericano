import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export type RequestUser = {
  sub: number;
  email: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const header: string | undefined = req.headers['authorization'];
    if (!header) throw new UnauthorizedException('Falta Authorization header');

    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Authorization inválido');
    }

    try {
      const secret =
        this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev_access_secret';
      const payload = (await this.jwt.verifyAsync(token, { secret })) as RequestUser;
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
