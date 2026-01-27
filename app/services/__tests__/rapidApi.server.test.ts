/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RapidApiService } from '../rapidApi.server';

describe('RapidApiService', () => {
  let service: RapidApiService;
  const mockHost = 'test.rapidapi.com';
  const mockKey = 'test-api-key';

  beforeEach(() => {
    service = new RapidApiService(mockHost, mockKey);
    vi.clearAllMocks();
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { success: true, data: 'test' };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await service.request({
        method: 'get',
        path: '/test',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://${mockHost}/test`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-rapidapi-host': mockHost,
            'x-rapidapi-key': mockKey,
          }),
        })
      );
    });

    it('should make successful POST request with payload', async () => {
      const mockResponse = { success: true };
      const mockPayload = { itemId: '123' };

      global.fetch = vi.fn().mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await service.request({
        method: 'post',
        path: '/test',
        payload: mockPayload,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://${mockHost}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockPayload),
        })
      );
    });

    it('should throw error on non-200 status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(
        service.request({
          method: 'get',
          path: '/test',
        })
      ).rejects.toThrow('RapidAPI request failed with status 404');
    });
  });

  describe('requestAll', () => {
    it('should make multiple successful requests', async () => {
      const mockResponses = [
        { success: true, data: 'test1' },
        { success: true, data: 'test2' },
      ];

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 200,
          text: async () => JSON.stringify(mockResponses[0]),
        })
        .mockResolvedValueOnce({
          status: 200,
          text: async () => JSON.stringify(mockResponses[1]),
        });

      const results = await service.requestAll([
        { method: 'get', path: '/test1' },
        { method: 'get', path: '/test2' },
      ]);

      expect(results).toEqual(mockResponses);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return null for failed requests', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 200,
          text: async () => JSON.stringify({ success: true }),
        })
        .mockResolvedValueOnce({
          status: 500,
          text: async () => 'Internal Server Error',
        });

      const results = await service.requestAll([
        { method: 'get', path: '/test1' },
        { method: 'get', path: '/test2' },
      ]);

      expect(results).toEqual([{ success: true }, null]);
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          status: 200,
          text: async () => JSON.stringify({ success: true }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const results = await service.requestAll([
        { method: 'get', path: '/test1' },
        { method: 'get', path: '/test2' },
      ]);

      expect(results).toEqual([{ success: true }, null]);
    });
  });
});
