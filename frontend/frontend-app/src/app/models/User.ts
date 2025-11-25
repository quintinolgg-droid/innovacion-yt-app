// user.model.ts

export class User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;

  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.password = '';
  }
}
