/**
 * This class gives you a way to throw name collision errors. For example,
 * if you try to add two loggers via Drash.addLogger() with the same name,
 * then this exception will be thrown because the names are colliding.
 */
export class NameCollisionException extends Error {
  /**
   * A property to hold the error message associated with this
   * exception.
   */
  public message: string;

  /**
   * Construct an object of this class.
   *
   * @param message - (optional) The exception message.
   */
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
