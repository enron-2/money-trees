import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class DtoConformInterceptor<T> implements NestInterceptor {
  constructor(private readonly kls: ClassConstructor<T>) {}
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) =>
        plainToInstance(this.kls, instanceToPlain(data), {
          excludeExtraneousValues: true,
        }),
      ),
    );
  }
}
