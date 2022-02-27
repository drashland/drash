export interface ISpecificationBuilder {
}

export interface IBuilder {
  toJson: () => Record<string, unknown>;
}
