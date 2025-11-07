import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export interface ORDERCONTENT {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export class OrderContentDto implements ORDERCONTENT {
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
