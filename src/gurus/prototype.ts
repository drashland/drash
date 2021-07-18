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
    cloneableProduct: T,
    cloneableOptions: Drash.Interfaces.ICreateableOptions = {},
  ): T {
    const clone = Object.create(cloneableProduct);
    for (const option in cloneableOptions) {
      clone[option] = cloneableOptions[option as keyof typeof cloneableOptions];
    }
    return clone;
  }
}
