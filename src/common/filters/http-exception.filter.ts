import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RateLimitException } from '../../github/exceptions/rate-limit.exception';
import { DailyLimitExceededException } from '../../reports/exceptions/daily-limit-exceeded.exception';
import { InvalidCredentialsException } from '../../auth/exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../users/exceptions/user-not-found.exception';
import { ReportNotFoundException } from '../../reports/exceptions/report-not-found.exception';
import { DuplicateEmailException } from '../../users/exceptions/duplicate-email.exception';
import { GithubApiException } from '../../github/exceptions/github-api.exception';
import { InvalidOldPasswordException } from '../../users/exceptions/invalid-old-password.exception';
import { UserInactiveException } from '../../auth/exceptions/user-inactive.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erro interno do servidor';

        if (exception instanceof RateLimitException) {
            status = HttpStatus.TOO_MANY_REQUESTS;
            message =
                'Limite de requisições da API do GitHub excedido. A API permite 60 requisições por hora para requisições não autenticadas. Por favor, tente novamente mais tarde.';
        } else if (exception instanceof DailyLimitExceededException) {
            status = HttpStatus.TOO_MANY_REQUESTS;
            message =
                'Limite diário de relatórios excedido. Você pode solicitar até 3 relatórios por dia.';
        } else if (exception instanceof InvalidCredentialsException) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'Email ou senha inválidos.';
        } else if (exception instanceof InvalidOldPasswordException) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'Senha antiga inválida.';
        } else if (exception instanceof UserInactiveException) {
            status = HttpStatus.UNAUTHORIZED;
            message = 'Usuário inativo.';
        } else if (exception instanceof UserNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = 'Usuário não encontrado.';
        } else if (exception instanceof ReportNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = 'Relatório não encontrado.';
        } else if (exception instanceof DuplicateEmailException) {
            status = HttpStatus.CONFLICT;
            message = 'Este email já está cadastrado.';
        } else if (exception instanceof GithubApiException) {
            status = HttpStatus.BAD_GATEWAY;
            message =
                'Erro ao comunicar com a API do GitHub. Por favor, tente novamente.';
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : (exceptionResponse as any).message || message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
