export function greet(name: string): string {
  return "Hello, " + name;
}

interface Details {
  company_name: string,
  name: string
}

class Employee {
  public company_name: string
  public name: string

  constructor(props: Details) {
    this.company_name = props.company_name
    this.name = props.name
  }

}

export class User extends Employee {
  constructor(details: Details) {
    super(details)
  }
}