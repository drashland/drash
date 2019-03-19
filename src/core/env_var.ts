/**
 * A class that helps mutate environment variables from strings.
 */
export default class EnvVar {

  /**
   * The value of the env var.
   *
   * @property string value
   */
  public value: string;

  /**
   * The name of the env var.
   *
   * @property string name
   */
  protected name: string;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param string name
   *     The name of the env var.
   * @param string value
   *     The value of the env var.
   */
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * Convert a JSON string env var to a JSON array.
   *
   * @return this
   */
  public toArray() {
    this.value = JSON.parse(this.value);
    return this;
  }
}
