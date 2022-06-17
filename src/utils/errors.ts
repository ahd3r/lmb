import { ValidationError as ClassValidationError } from 'class-validator';

export class ValidationError extends Error {
  public status: number;

  constructor(msg: string) {
    super(msg);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export class ArrayValidationError extends Error {
  public status: number;
  public errors: { message: string }[];

  constructor(msg: string, errors: ClassValidationError[]) {
    super(msg);
    this.name = 'ArrayValidationError';
    this.status = 400;
    this.errors = errors
      .map((error) => Object.values(error.constraints))
      .reduce((res, arr) => res.concat(arr), [])
      .map((message) => ({ message })) as any;
  }
}

export class NotFoundError extends Error {
  public status: number;

  constructor(msg: string) {
    super(msg);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class NotImplementedError extends Error {
  public status: number;

  constructor() {
    super('Comming soon...');
    this.name = 'NotImplementedError';
    this.status = 404;
  }
}

export class ForbidenError extends Error {
  public status: number;

  constructor(msg: string) {
    super(msg);
    this.name = 'ForbidenError';
    this.status = 403;
  }
}

export class ServerError extends Error {
  public status: number;

  constructor(msg: string) {
    super(msg);
    this.name = 'ServerError';
    this.status = 500;
  }
}
