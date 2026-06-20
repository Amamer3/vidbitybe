export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}
