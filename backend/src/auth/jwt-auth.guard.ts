import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//the check for if jwt token is present and valid, if not it will return 401 unauthorized error
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}