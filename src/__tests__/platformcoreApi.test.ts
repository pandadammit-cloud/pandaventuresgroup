// PM-generated stub — complete the TODOs before relying on this test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('platformcoreApi', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_PLATFORMCORE_API_URL', 'https://api.example.com');
    vi.stubEnv('VITE_PLATFORMCORE_API_KEY', 'test-key');
    mockFetch.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  describe('listDockGuides', () => {
    it('fetches all guides when no status filter supplied', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ guides: [] }) });
      const { listDockGuides } = await import('../lib/platformcoreApi');
      const result = await listDockGuides();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/guides/dock',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-key' }) }),
      );
      expect(result).toEqual({ guides: [] });
    });

    it('appends status query param when provided', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ guides: [] }) });
      const { listDockGuides } = await import('../lib/platformcoreApi');
      await listDockGuides('published');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/guides/dock?status=published',
        expect.anything(),
      );
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });
      const { listDockGuides } = await import('../lib/platformcoreApi');
      await expect(listDockGuides()).rejects.toThrow('401 Unauthorized');
    });
  });

  describe('getGuide', () => {
    it('URL-encodes guideTypeId and entityId', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      const { getGuide } = await import('../lib/platformcoreApi');
      await getGuide('dock guide', 'port/123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/guides/dock%20guide/port%2F123',
        expect.anything(),
      );
    });
  });
});
