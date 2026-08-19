import { test, expect } from '../../src/fixtures/base';
import { JsonPlaceholderClient } from '../../src/api/JsonPlaceholderClient';
import contractData from '../data/api-contract.json' with { type: 'json' };

test.describe('JSONPlaceholder API', () => {
  test('returns users from the public API @smoke @api', async ({ request }) => {
    const apiClient = new JsonPlaceholderClient(request);
    const response = await apiClient.getUsers();
    const payload = await response.json();

    expect(response.status()).toBe(200);
    expect(payload.length).toBeGreaterThanOrEqual(contractData.minimumUserCount);
  });

  test('returns the expected contract for a known post @regression @api', async ({ request }) => {
    const apiClient = new JsonPlaceholderClient(request);
    const response = await apiClient.getPost(contractData.knownPost.id);
    const payload = await response.json();

    expect(response.status()).toBe(200);
    expect(payload).toMatchObject({ id: contractData.knownPost.id, userId: contractData.knownPost.userId });
    for (const key of contractData.knownPost.requiredKeys) {
      expect(payload).toHaveProperty(key);
    }
  });

  test('returns not found for an unknown post @regression @api', async ({ request }) => {
    const apiClient = new JsonPlaceholderClient(request);
    const response = await apiClient.getPost(contractData.missingPost.id);

    expect(response.status()).toBe(404);
  });
});
