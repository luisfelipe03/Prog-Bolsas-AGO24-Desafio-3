import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config({ path: '.env' });

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASS',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME',
  'GOOGLE_API_KEY',
];

const filteredEnv = requiredEnvVars.reduce(
  (acc, key) => {
    const value = process.env[key];
    if (value) {
      acc[key] = value;
    } else {
      console.warn(`⚠️ Missing environment variable: ${key}`);
    }
    return acc;
  },
  {} as Record<string, string>,
);

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
  GOOGLE_API_KEY: Joi.string().required(),
});

const { error, value } = envSchema.validate(filteredEnv, {
  abortEarly: false,
  allowUnknown: true,
});

if (error) {
  console.error('Invalid environment variables:', error.details);
  throw new Error('Invalid environment variables');
}

export const env = value as {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_BUCKET_NAME: string;
  GOOGLE_API_KEY: string;
};
