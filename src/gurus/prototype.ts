import * as Drash from "../../mod.ts";

/**
 * Clone an object.
 *
 * This is a modified implementation as shown on the following page:
 *
 *     https://refactoring.guru/design-patterns/prototype
 */
export class Prototype {
  static clone<T extends object>(
    cloneableProduct: T
  ): T {
    return Object.create(cloneableProduct);
  }
}
