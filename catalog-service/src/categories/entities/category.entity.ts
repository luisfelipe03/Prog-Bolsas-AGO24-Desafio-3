import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  image_url: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  static create(data: Category) {
    const category = new Category();
    Object.assign(category, data);
    return category;
  }

  updateName(name: string) {
    this.name = name;
  }
}
