/**
 * A class that helps mutate environment variables from strings.
 */
export default class EnvVar {
  public value;
  protected name;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

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
