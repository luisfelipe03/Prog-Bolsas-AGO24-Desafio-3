import { Category } from 'src/categories/entities/category.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  brand: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  volume: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  alcohol_content: number | null;

  @Column({ default: true })
  is_active: boolean;

  @Column()
  image_url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  static create(data: Product) {
    const product = new Product();
    Object.assign(product, data);
    return product;
  }
}
