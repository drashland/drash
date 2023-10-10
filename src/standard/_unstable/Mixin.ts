/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

// Types

// Imports > Core

// Imports > Standard

/**
 * An instance of the given `T` generic.
 */
export type Constructor<T, A extends unknown[] = []> = new (
  ...args: A
) => T;

/**
 * Inspiration taken from:
 *
 * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
type Intersect<U> = IntersectEval<U> extends (k: infer I) => void ? I : never;

/**
 * Inspiration taken from:
 *
 * https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
type IntersectEval<U> = U extends unknown ? (k: U) => void : never;

/**
 * Build a {@link Mixin}
 */
class MixinBuilder<
  B extends Constructor<unknown>,
  C extends Constructor<unknown>[],
> {
  #base_class?: B;
  #classes?: C;

  baseClass(BaseClass: B): this {
    this.#base_class = BaseClass;
    return this;
  }

  classes(classes: C): this {
    this.#classes = classes;
    return this;
  }

  build(): Constructor<
    Intersect<InstanceType<B> & InstanceType<[...C][number]>>
  > {
    if (!this.#base_class) {
      throw new Error(`Cannot create mixin without the base class.`);
    }

    if (!this.#classes) {
      throw new Error(`Cannot create mixin without classes to mix.`);
    }

    this.#classes.forEach((baseCtor) => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
        Object.defineProperty(
          this.#base_class!.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
            Object.create(null),
        );
      });
    });

    // console.log(this.#classes[0].prototype);

    return this.#base_class as Constructor<
      Intersect<InstanceType<B> & InstanceType<[...C][number]>>
    >;
  }
}

/**
 * Build a mixin class by merging  `...classes` into `BasClass`. The result is a mixin as shown in the TypeScript documentation pages at:
 *
 * {@link https://www.typescriptlang.org/docs/handbook/mixins.html}.
 *
 * @param BaseClass The class to extend.
 * @param classes ({@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters Rest Parameter}) All classes to merge into the `BaseClass`.
 * @returns The `BaseClass` with all classes merged into it.
 *
 * @example
 * ```ts
 * class SomeBaseClass {
 *   public run() {
 *     return "We are running.";
 *   }
 * }
 *
 * class Hello {
 *   public hello() {
 *     return "hello";
 *   }
 * }
 *
 * class World {
 *   public world() {
 *     return "world";
 *   }
 * }
 *
 * class HelloWorld extends BaseClass(SomeBaseClass).With(
 *   Hello,
 *   World,
 * ) {
 *   public helloWorld() {
 *     return this.hello() + this.world();
 *   }
 * }
 * ```
 */
export function Mixin<
  BaseClass extends Constructor<unknown>,
  Constructors extends Constructor<unknown>[],
>(
  BaseClass: BaseClass,
  ...constructors: Constructors
): Constructor<
  Intersect<InstanceType<BaseClass> & InstanceType<[...Constructors][number]>>
> {
  const builder = new MixinBuilder<BaseClass, Constructors>();

  return builder
    .baseClass(BaseClass)
    .classes(constructors)
    .build();
}
