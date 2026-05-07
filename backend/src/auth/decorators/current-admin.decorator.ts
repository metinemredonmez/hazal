import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthAdmin {
  id: string;
  email: string;
  name: string;
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthAdmin => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
