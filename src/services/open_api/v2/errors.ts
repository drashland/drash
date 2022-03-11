class SpecError extends Error {
  constructor(message: string) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ParameterObjectError extends SpecError {}
export class PathItemObjectError extends SpecError {}
export class OperationObjectError extends SpecError {}
