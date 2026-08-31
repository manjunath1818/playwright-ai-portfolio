import type { APIRequestContext, APIResponse } from '@playwright/test';

export type ContactPayload = {
  firstName: string;
  lastName: string;
  birthdate: string;
  email: string;
  phone: string;
  street1: string;
  street2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

type LoginResponse = {
  token: string;
};

export class ContactListClient {
  private token?: string;

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = process.env.CONTACT_LIST_BASE_URL ??
      'https://thinking-tester-contact-list.herokuapp.com',
  ) {}

  async authenticateFromEnvironment(): Promise<APIResponse> {
    const email = process.env.CONTACT_LIST_EMAIL;
    const password = process.env.CONTACT_LIST_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'Set CONTACT_LIST_EMAIL and CONTACT_LIST_PASSWORD before running the Contact List API tests.',
      );
    }

    const response = await this.login(email, password);
    if (response.ok()) {
      const payload = (await response.json()) as LoginResponse;
      this.token = payload.token;
    }
    return response;
  }

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users/login`, {
      data: { email, password },
    });
  }

  async getContacts(authenticated = true): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/contacts`, {
      headers: this.authorizationHeaders(authenticated),
    });
  }

  async getContact(contactId: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/contacts/${contactId}`, {
      headers: this.authorizationHeaders(),
    });
  }

  async createContact(contact: ContactPayload): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/contacts`, {
      headers: this.authorizationHeaders(),
      data: contact,
    });
  }

  async updateContact(contactId: string, contact: ContactPayload): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/contacts/${contactId}`, {
      headers: this.authorizationHeaders(),
      data: contact,
    });
  }

  async deleteContact(contactId: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/contacts/${contactId}`, {
      headers: this.authorizationHeaders(),
    });
  }

  private authorizationHeaders(authenticated = true): Record<string, string> {
    if (!authenticated) {
      return {};
    }
    if (!this.token) {
      throw new Error('Authenticate the ContactListClient before making this request.');
    }
    return { Authorization: `Bearer ${this.token}` };
  }
}
