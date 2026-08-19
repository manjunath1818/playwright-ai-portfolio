import type { APIRequestContext, APIResponse } from '@playwright/test';

export class JsonPlaceholderClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = process.env.JSONPLACEHOLDER_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
  ) {}

  async getPost(postId: number): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/posts/${postId}`);
  }

  async getUsers(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users`);
  }
}
