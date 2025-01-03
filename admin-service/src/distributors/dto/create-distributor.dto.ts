import * as Joi from 'joi';

export const CreateDistributorSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  phone: Joi.string()
    .min(11)
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  cnpj: Joi.string()
    .pattern(/^\d{14}$/)
    .required(),
  type: Joi.string().valid('store', 'pdv').required(),
  address: Joi.object({
    street: Joi.string().min(3).max(100).required(),
    number: Joi.string().max(10).required(),
    neighborhood: Joi.string().min(3).max(50).required(),
    city: Joi.string().min(3).max(50).required(),
    state: Joi.string().length(2).uppercase().required(),
    zip: Joi.string()
      .pattern(/^\d{8}$/)
      .required(),
  }).required(),
});

export class CreateDistributorDto {
  name: string;
  phone: string;
  email: string;
  password: string;
  cnpj: string;
  type: 'store' | 'pdv';
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
}
