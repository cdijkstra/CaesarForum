import { BaseModel } from 'pocketbase';

export interface User extends BaseModel {
  name: string;
  email: string;
  profilePictureUrl: string;
}
