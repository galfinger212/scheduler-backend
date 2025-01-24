export interface IAuthorizedRequestInterface extends Request {
  user: {
    userId: string;
    role: 'USER' | 'ADMIN';
  };
}
