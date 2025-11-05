import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ORDERCONTENT } from '../entities/order.schema';
import { Type } from 'class-transformer';

class OrderContentDto implements ORDERCONTENT {
  @IsOptional()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  productName: string;

  @IsOptional()
  quantity: number;

  @IsOptional()
  price: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsOptional()
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderContentDto)
  content: OrderContentDto[];
}
