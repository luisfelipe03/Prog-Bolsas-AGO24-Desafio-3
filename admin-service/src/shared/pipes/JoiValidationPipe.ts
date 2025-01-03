import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: ObjectSchema) {}

  transform(value: any) {
    const { error } = this.schema.validate(value, { abortEarly: false });
    if (error) {
      // Formata as mensagens de erro para serem mais claras e amigáveis
      const message = error.details
        .map((detail) => this.formatErrorMessage(detail))
        .join('; ');
      throw new BadRequestException(`Validation failed: ${message}`);
    }
    return value;
  }

  private formatErrorMessage(detail: any): string {
    const field = detail.context?.label || detail.path.join('.');
    const messages: Record<string, string> = {
      'string.email': `${field} deve ser um e-mail válido`,
      'string.min': `${field} deve ter pelo menos ${detail.context?.limit} caracteres`,
      'string.max': `${field} deve ter no máximo ${detail.context?.limit} caracteres`,
      'any.required': `${field} é obrigatório`,
      'string.pattern.base': `${field} está no formato incorreto`,
      'any.only': `${field} deve ser um dos seguintes valores: ${detail.context?.valids?.join(', ')}`,
    };
    return messages[detail.type] || `${field} está inválido`;
  }
}
