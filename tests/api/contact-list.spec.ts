import { test, expect } from '../../src/fixtures/base';
import { ContactListClient, type ContactPayload } from '../../src/api/ContactListClient';
import contactData from '../data/contact-list.json' with { type: 'json' };

type ContactResponse = ContactPayload & {
  _id: string;
  owner: string;
};

test.describe('Contact List API', () => {
  // The service maintains one active token per user, so concurrent logins for the
  // same test account invalidate one another.
  test.describe.configure({ mode: 'serial' });

  test('authenticates a registered user @critical @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);

    const response = await apiClient.authenticateFromEnvironment();
    const payload = await response.json();

    expect(response.status()).toBe(200);
    expect(payload).toEqual(expect.objectContaining({ token: expect.any(String) }));
  });

  test('rejects an invalid login @regression @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);

    const response = await apiClient.login('unknown-user@example.com', 'invalid-password');

    expect(response.status()).toBe(401);
  });

  test('creates a contact @critical @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    let contactId: string | undefined;

    try {
      await test.step('Authenticate and create a contact', async () => {
        expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);
        const response = await apiClient.createContact(contactData.contact);
        const payload = (await response.json()) as ContactResponse;
        contactId = payload._id;

        expect(response.status()).toBe(201);
        expect(payload).toEqual(expect.objectContaining(contactData.contact));
        expect(payload._id).toEqual(expect.any(String));
      });
    } finally {
      if (contactId) {
        await apiClient.deleteContact(contactId);
      }
    }
  });

  test('lists the authenticated user contacts @smoke @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    let contactId: string | undefined;

    try {
      expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);
      const createResponse = await apiClient.createContact(contactData.contact);
      const createdContact = (await createResponse.json()) as ContactResponse;
      contactId = createdContact._id;

      const response = await apiClient.getContacts();
      const payload = (await response.json()) as ContactResponse[];

      expect(response.status()).toBe(200);
      expect(payload).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: contactId })]),
      );
    } finally {
      if (contactId) {
        await apiClient.deleteContact(contactId);
      }
    }
  });

  test('gets a contact by ID @smoke @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    let contactId: string | undefined;

    try {
      expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);
      const createResponse = await apiClient.createContact(contactData.contact);
      contactId = ((await createResponse.json()) as ContactResponse)._id;

      const response = await apiClient.getContact(contactId);
      const payload = (await response.json()) as ContactResponse;

      expect(response.status()).toBe(200);
      expect(payload).toEqual(expect.objectContaining({ _id: contactId, ...contactData.contact }));
      expect(response.headers()['content-type']).toContain('application/json');
    } finally {
      if (contactId) {
        await apiClient.deleteContact(contactId);
      }
    }
  });

  test('updates an existing contact @critical @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    let contactId: string | undefined;

    try {
      expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);
      const createResponse = await apiClient.createContact(contactData.contact);
      contactId = ((await createResponse.json()) as ContactResponse)._id;

      const response = await apiClient.updateContact(contactId, contactData.updatedContact);
      const payload = (await response.json()) as ContactResponse;

      expect(response.status()).toBe(200);
      expect(payload).toEqual(
        expect.objectContaining({ _id: contactId, ...contactData.updatedContact }),
      );
    } finally {
      if (contactId) {
        await apiClient.deleteContact(contactId);
      }
    }
  });

  test('deletes an existing contact @critical @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);

    expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);
    const createResponse = await apiClient.createContact(contactData.contact);
    const contactId = ((await createResponse.json()) as ContactResponse)._id;

    const deleteResponse = await apiClient.deleteContact(contactId);
    const getResponse = await apiClient.getContact(contactId);

    expect(deleteResponse.status()).toBe(200);
    expect(getResponse.status()).toBe(404);
  });

  test('rejects an unauthenticated contact-list request @regression @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);

    const response = await apiClient.getContacts(false);

    expect(response.status()).toBe(401);
  });

  test('returns not found for an invalid contact ID @regression @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);

    const response = await apiClient.getContact(contactData.invalidContactId);

    expect(response.status()).toBe(404);
  });

  test('rejects a contact without a first name @regression @api', async ({ request }) => {
    const apiClient = new ContactListClient(request);
    expect((await apiClient.authenticateFromEnvironment()).status()).toBe(200);

    const response = await apiClient.createContact({ ...contactData.contact, firstName: '' });
    const payload = await response.json();

    expect(response.status()).toBe(400);
    expect(payload).toEqual(
      expect.objectContaining({
        _message: 'Contact validation failed',
        errors: expect.objectContaining({
          firstName: expect.objectContaining({
            kind: 'required',
            path: 'firstName',
            value: '',
          }),
        }),
      }),
    );
  });
});
