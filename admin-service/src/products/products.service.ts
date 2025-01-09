import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileUploadException } from '../shared/errors/fileUploadException';
import { CategoriesService } from '../categories/categories.service';
import { NoProductsNotFoundException } from './errors/noProductNotFoundException';
import { ProductNotFoundException } from './errors/productNotFoundException';
import { UpdateProductDto } from './dto/update-product.dto';
import { env } from 'src/shared/env';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmProductRepository } from './repositories/typeORM/type-orm-product-repository';
import { Product } from './entities/product.entity';
import logger from 'src/shared/logger';

@Injectable()
export class ProductsService {
  private readonly s3Client = new S3Client({
    region: env.AWS_REGION,
  });

  constructor(
    @Inject() private readonly categoryService: CategoriesService,
    private productRepo: TypeOrmProductRepository,
    private amqpConnection: AmqpConnection,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { name, category_id, cover } = createProductDto;

    const category = await this.categoryService.findOne(category_id);
    if (!category) {
      logger.info('Category not found');
      throw new BadRequestException('Category not found');
    }

    let image_url: string =
      'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/category/generica.png';

    try {
      if (cover) {
        if (!['image/png', 'image/jpeg'].includes(cover.mimetype)) {
          throw new BadRequestException(
            'Invalid file type. Only PNG and JPEG are allowed.',
          );
        }

        const fileName = `${name.toLocaleLowerCase().replace(/\s+/g, '-')}.${cover.mimetype.split('/')[1]}`;

        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `products/${fileName}`,
            Body: cover.buffer,
          }),
        );

        logger.info('Image uploaded to S3', {
          bucket: env.AWS_BUCKET_NAME,
          key: `products/${fileName}`,
        });

        image_url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/products/${fileName}`;
      }

      const product = Product.create({
        name,
        description: createProductDto.description,
        brand: createProductDto.brand,
        volume: createProductDto.volume,
        alcohol_content: createProductDto.alcohol_content,
        price: createProductDto.price,
        image_url,
        category,
      });

      const savedProduct = await this.productRepo.save(product);

      await this.amqpConnection.publish(
        'products',
        'product.created',
        savedProduct,
      );

      logger.info('Product created', { product: savedProduct });
      logger.info('Message published to RabbitMQ', {
        exchange: 'products',
        routingKey: 'product.created',
        payload: savedProduct,
      });

      return savedProduct;
    } catch (error) {
      logger.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      logger.error('Error uploading image to S3:', error);
      throw new FileUploadException('Error uploading image to S3');
    }
  }

  async findAll() {
    const products = await this.productRepo.getProducts();
    if (products.length === 0) {
      logger.info('No products found');
      throw new NoProductsNotFoundException();
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepo.getProductById(id);

    if (!product) {
      logger.info('Product not found');
      throw new ProductNotFoundException();
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepo.getProductById(id);

    if (!product) {
      throw new ProductNotFoundException();
    }

    const genericImageUrl =
      'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/product/generic.png';

    const {
      name,
      description,
      brand,
      volume,
      alcohol_content,
      price,
      category_id,
      cover,
    } = updateProductDto;

    if (name) product.name = name;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (volume) product.volume = volume;
    if (alcohol_content) product.alcohol_content = alcohol_content;
    if (price) product.price = price;

    if (category_id && product.category.id !== category_id) {
      const newCategory = await this.categoryService.findOne(category_id);
      if (!newCategory) {
        throw new BadRequestException('Category not found');
      }
      product.category = newCategory;
    }

    if (cover) {
      if (product.image_url && product.image_url !== genericImageUrl) {
        const oldFileKey = product.image_url.split('.amazonaws.com/')[1];
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: oldFileKey,
            }),
          );

          logger.info('Old image deleted from S3', {
            bucket: env.AWS_BUCKET_NAME,
            key: oldFileKey,
          });
        } catch (error) {
          logger.error('Error deleting old image from S3', error);
          throw new FileUploadException('Error deleting old image from S3');
        }
      }

      const fileExtension = cover.mimetype.split('/')[1];
      const fileName = `${product.name.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`;

      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: `products/${fileName}`,
            Body: cover.buffer,
          }),
        );

        logger.info('Image uploaded to S3', {
          bucket: env.AWS_BUCKET_NAME,
          key: `products/${fileName}`,
        });
      } catch (error) {
        logger.error('Error uploading new image to S3:', error);
        throw new FileUploadException('Error uploading new image to S3');
      }

      product.image_url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/products/${fileName}`;
    }

    const updatedProduct = await this.productRepo.save(product);

    await this.amqpConnection.publish(
      'products',
      'product.updated',
      updatedProduct,
    );

    logger.info('Product updated', { product: updatedProduct });
    logger.info('Message published to RabbitMQ', {
      exchange: 'products',
      routingKey: 'product.updated',
      payload: updatedProduct,
    });

    return updatedProduct;
  }

  async remove(id: string) {
    const product = await this.productRepo.getProductById(id);

    if (!product) {
      throw new ProductNotFoundException();
    }

    if (
      product.image_url ||
      product.image_url !==
        'https://devbeer-image-storage.s3.us-east-2.amazonaws.com/product/generic.png'
    ) {
      const fileKey = product.image_url.split('.amazonaws.com/')[1];
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
          }),
        );
        logger.info('Image deleted from S3', {
          bucket: env.AWS_BUCKET_NAME,
          key: fileKey,
        });
      } catch (error) {
        logger.error('Error deleting image from S3', error);
        throw new FileUploadException('Error deleting image from S3');
      }
    }

    await this.productRepo.deleteProduct(product.id);

    await this.amqpConnection.publish('products', 'product.deleted', product);

    logger.info('Product deleted', { product });
    logger.info('Message published to RabbitMQ', {
      exchange: 'products',
      routingKey: 'product.deleted',
      payload: product,
    });
  }
}
