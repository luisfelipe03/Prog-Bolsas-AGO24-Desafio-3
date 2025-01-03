import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { env } from 'src/shared/env';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Repository } from 'typeorm';
import { FileUploadException } from 'src/shared/errors/fileUploadException';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryNotFoundException } from './errors/categoryNotFoundException';
import { NoCategoriesFoundException } from './errors/noCategoriesFoundException';

@Injectable()
export class CategoriesService {
  private readonly s3Client = new S3Client({
    region: env.AWS_REGION,
  });

  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { cover, name } = createCategoryDto;

    let image_url: string = null;

    try {
      if (cover) {
        const fileName = `${name.toLocaleLowerCase().replace(/\s+/g, '-')}.${cover.mimetype.split('/')[1]}`;

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `category/${fileName}`,
            Body: cover.buffer,
          }),
        );

        image_url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/category/${fileName}`;
      } else {
        image_url =
          'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/category/generica.png';
      }

      const category = Category.create({
        name,
        image_url,
      });

      return this.categoryRepo.save(category);
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw new FileUploadException('Error uploading image to S3');
    }
  }

  async findAll() {
    const categories = await this.categoryRepo.find();
    if (categories.length === 0) {
      throw new NoCategoriesFoundException();
    }
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return category;
  }
}
