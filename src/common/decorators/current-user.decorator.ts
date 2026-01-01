import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CURRENT_USER = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);

export const CurrentUser = CURRENT_USER;
