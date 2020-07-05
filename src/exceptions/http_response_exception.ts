import { HttpException } from "./http_exception.ts";

/**
 * This class gives you a way to throw HTTP errors semantically in the
 * response class. The difference between this class and HttpException
 * comes when you want to check which exception was thrown via
 * exception.constructor.name.
 */
export class HttpResponseException extends HttpException {}
