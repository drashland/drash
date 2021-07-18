import * as Interfaces from "../interfaces.ts";
import * as Types from "../types.ts";

/**
 * Create a class that implements the ICreateable interface. Classes that
 * implement the ICreateable interface do not have constructor()
 * implementations, so this class is in charge of creating those classes.
 *
 * This is a modified implementation as shown on the following page:
 *
 *     https://refactoring.guru/design-patterns/factory-method
 */
export class Factory {
  static create<T extends Interfaces.ICreateable>(
    createableProduct: Types.TConstructor<T>,
    createableClassOptions: Interfaces.ICreateableOptions = {},
  ): T {
    const product = new createableProduct();
    product.addOptions(createableClassOptions);
    product.create();
    return product;
  }
}
