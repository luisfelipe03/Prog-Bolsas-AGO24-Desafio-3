import { Test, TestingModule } from '@nestjs/testing';
import { CorreiosService } from './correios.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CorreiosService', () => {
  let service: CorreiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorreiosService],
    }).compile();

    service = module.get<CorreiosService>(CorreiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
