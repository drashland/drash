import { ICreateable, ICreateableOptions } from "../interfaces.ts";


// @ts-ignore
type Constructor<T extends unknown> = new (...args: any) => T;

export class Factory {
  static create<T extends ICreateable>(
    createableProduct: Constructor<T>,
    createableClassOptions: ICreateableOptions = {}
  ): T {
    const product = new createableProduct();
    product.addOptions(createableClassOptions);
    product.create();
    return product;
  }
}
