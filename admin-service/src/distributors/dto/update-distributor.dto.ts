import { PartialType } from '@nestjs/mapped-types';
import * as Joi from 'joi';
import { CreateDistributorDto } from './create-distributor.dto';

export const UpdateDistributorSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  phone: Joi.string()
    .min(11)
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).max(128).optional(),
  cnpj: Joi.string()
    .pattern(/^\d{14}$/)
    .optional(),
  type: Joi.string().valid('store', 'pdv').optional(),
  address: Joi.object({
    street: Joi.string().min(3).max(100).optional(),
    number: Joi.string().max(10).optional(),
    neighborhood: Joi.string().min(3).max(50).optional(),
    city: Joi.string().min(3).max(50).optional(),
    state: Joi.string().length(2).uppercase().optional(),
    zip: Joi.string()
      .pattern(/^\d{8}$/)
      .optional(),
  }).optional(),
});

export class UpdateDistributorDto extends PartialType(CreateDistributorDto) {}
