import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { env } from 'src/shared/env';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Repository } from 'typeorm';
import { FileUploadException } from 'src/shared/errors/fileUploadException';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryNotFoundException } from './errors/categoryNotFoundException';
import { NoCategoriesFoundException } from './errors/noCategoriesFoundException';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class CategoriesService {
  private readonly s3Client = new S3Client({
    region: env.AWS_REGION,
  });

  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private amqpConnection: AmqpConnection,
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

      await this.amqpConnection.publish(
        'categories',
        'category.created',
        category,
      );

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

  async update({ id, cover, name }: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOneBy({ id });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (name) category.updateName(name);

    const genericImageUrl =
      'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/category/generica.png';

    if (cover) {
      if (category.image_url && category.image_url !== genericImageUrl) {
        const oldFileKey = category.image_url.split('.amazonaws.com/')[1];
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: oldFileKey,
            }),
          );
        } catch (error) {
          console.error('Error deleting old image from S3', error);
          throw new FileUploadException('Error deleting old image from S3');
        }
      }

      const fileExtension = cover.mimetype.split('/')[1];
      const fileName = `${category.name.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`;

      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `category/${fileName}`,
            Body: cover.buffer,
          }),
        );
      } catch (error) {
        console.error('Error uploading new image to S3:', error);
        throw new FileUploadException('Error uploading new image to S3');
      }

      category.image_url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/category/${fileName}`;
    }

    await this.amqpConnection.publish(
      'categories',
      'category.updated',
      category,
    );

    return this.categoryRepo.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepo.findOneBy({ id });

    if (!category) {
      throw new CategoryNotFoundException();
    }

    if (category.image_url) {
      const imageKey = category.image_url.split('.amazonaws.com/')[1];

      try {
        if (
          category.image_url !==
          'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/category/generica.png'
        ) {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: imageKey,
            }),
          );
        }
      } catch (error) {
        console.error('Error deleting image from S3:', error);
        throw new FileUploadException('Error deleting image from S3');
      }
    }

    await this.amqpConnection.publish(
      'categories',
      'category.deleted',
      category,
    );

    return this.categoryRepo.delete(id);
  }
}
