import { applyDecorators } from '@nestjs/common';
import { Transform, TransformFnParams } from 'class-transformer';

export function StringTransform() {
  return applyDecorators(
    Transform((params: TransformFnParams) =>
      typeof params.value === 'string' ? params.value.trim() : params.value,
    ),
  );
}
