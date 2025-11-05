import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum ORDERSTATUS {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface ORDERCONTENT {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop()
  orderId: string;

  @Prop()
  userId: string;

  @Prop({ enum: ORDERSTATUS })
  orderStatus: ORDERSTATUS;

  @Prop()
  price: number;

  @Prop({
    type: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
      },
    ],
  })
  content: ORDERCONTENT[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
