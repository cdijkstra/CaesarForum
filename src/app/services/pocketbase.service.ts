/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable } from '@angular/core';

import PocketBase, { BaseModel, RecordModel, RecordService } from 'pocketbase';
import { Environment } from '../environments/env.interface';
import { User } from '../models/user.model';

import { ListResult } from 'pocketbase';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Page<T> extends ListResult<T> {}

@Injectable({
  providedIn: 'root',
})
export class PocketbaseService {
  environment = inject(Environment);
  client: PocketBase;

  constructor() {
    this.client = new PocketBase(this.environment.pocketbase.baseUrl);
  }

  async create<T>(collectionName: string, item: Partial<T>): Promise<T> {
    const result = await this.getCollection(collectionName).create(item as any);
    return result as unknown as T;
  }

  async update<T extends BaseModel>(collectionName: string, item: T): Promise<T> {
    const result = await this.getCollection(collectionName).update(item.id, item);
    return result as unknown as T;
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const result = await this.client.collection(collectionName).delete(id);
    return result;
  }

  async getOne<T>(
    collectionName: string,
    id: string,
    options?: {
      expand?: string;
      filter?: string;
      sort?: string;
    }
  ): Promise<T> {
    const data = await this.getCollection(collectionName).getOne(id, options);
    return data as T;
  }

  async getAll<T>(
    collectionName: string,
    options?: {
      expand?: string;
      filter?: string;
      sort?: string;
    }
  ): Promise<T[]> {
    const data = await this.getCollection(collectionName).getFullList(options);
    return data as T[];
  }

  async getPage<T>(
    collectionName: string,
    page: number,
    perPage: number,
    expand?: string
  ): Promise<Page<T>> {
    const pbPage = await this.getCollection(collectionName).getList(page, perPage, { expand });

    const pageModel = {
      page,
      perPage,
      items: pbPage.items as T[],
      totalItems: pbPage.totalItems,
      totalPages: pbPage.totalPages,
    } as Page<T>;

    return pageModel;
  }

  async getFileToken(): Promise<string> {
    return await this.client.files.getToken();
  }

  // Authentication methods
  async login(username: string, password: string): Promise<User> {
    const authData = await this.client.collection('users').authWithPassword(username, password);
    return authData.record as unknown as User;
  }

  // Superuser login
  async loginSuperuser(usernameOrEmail: string, password: string): Promise<User> {
    const authData = await this.client
      .collection('_superusers')
      .authWithPassword(usernameOrEmail, password);
    return authData.record as unknown as User;
  }

  // OAuth2 login
  loginWithOAuth2(provider: string): void {
    this.client
      .collection('users')
      .authWithOAuth2({
        provider: provider,
        scopes: ['email', 'openid', 'profile'],
        createData: {
          emailVisibility: false,
        },
      })
      .catch((error) => {
        console.error('OAuth login error:', error);
      });
  }

  logout(): void {
    this.client.authStore.clear();
  }

  isAuthenticated(): boolean {
    return this.client.authStore.isValid;
  }

  getCurrentUser(): User | null {
    return this.client.authStore.model as User | null;
  }

  private getCollection(nameOrId: string): RecordService<RecordModel> {
    return this.client.collection(nameOrId);
  }
}
