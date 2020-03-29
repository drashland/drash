/**
 * @memberof Drash.Services
 * @class ClassOne
 * @description
 *     Class one does class one things.
 */
export default class ClassOne {
  /**
   * @property string property_one
   *     Class one property one.
   *
   *     This is a second paragraph.
   *
   *     This is a third paragraph.
   *     There is also a sentence below this third paragraph.
   *
   *     This is a fourth paragraph.
   */
  public property_one: string = "";

  /**
   * Class one method one.
   *
   * This is a second paragraph.
   *
   * This is a third paragraph.
   * There is also a sentence below this third paragraph.
   *
   * This is a fourth paragraph.
   *
   * @param any myObject
   *     My object.
   * @param string myString
   *     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibus
   *     malesuada leo, vitae vehicula tellus. Aliquam a est in nisi placerat
   *     placerat quis vitae lectus. Class aptent taciti sociosqu ad litora
   *     torquent per conubia nostra, per inceptos himenaeos. Aenean vulputate
   *     sed leo eu faucibus. Suspendisse mauris diam, congue finibus finibus
   *     eu, bibendum sit amet justo. Fusce eu enim mollis, viverra tortor ut,
   *     sagittis velit. Cras lobortis augue sed eleifend blandit. Aenean
   *     scelerisque viverra facilisis. Morbi sit amet pulvinar diam. Sed id
   *     tortor et sem semper imperdiet in ut libero.
   *
   *     This is a second paragraph.
   *     This is another line belonging to the second paragraph.
   *
   *     This is a third paragraph.
   *
   * @return any|undefined
   *     Returns any when something cool happens.
   *
   *     Returns undefined when uhhhhhhhhhh k.
   *
   * @return string
   *     Returns a string when the other two don't get got returRrRrRrned.
   *
   * @throws SomeException
   *     Thrown when something happens.
   *
   *     Thrown when something else happens too.
   * @throws SomeOtherException
   *     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam finibus
   *     malesuada leo, vitae vehicula tellus. Aliquam a est in nisi placerat
   *     placerat quis vitae lectus. Class aptent taciti sociosqu ad litora
   *     torquent per conubia nostra, per inceptos himenaeos. Aenean vulputate
   *     sed leo eu faucibus. Suspendisse mauris diam, congue finibus finibus
   *     eu, bibendum sit amet justo. Fusce eu enim mollis, viverra tortor ut,
   *     sagittis velit. Cras lobortis augue sed eleifend blandit. Aenean
   *     scelerisque viverra facilisis. Morbi sit amet pulvinar diam. Sed id
   *     tortor et sem semper imperdiet in ut libero.
   *
   *     This is a second paragraph.
   */
  public classOneMethodOne(myObject: any, myString: string) {}

  /**
   * Test that a multline signature is parsed correctly.
   */
  public multiLineSig(
    paramUno: any,
    paramDos: number,
    paramTres: string,
    paramFour: boolean,
    paramFive: any,
    paramSix: number,
    paramSeven: string,
  ): any {}
}
