import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from '../../src/services/api';

describe('ApiService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    it('should make GET request correctly', async () => {
        const mockResponse = { id: 1, name: 'Test' };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await ApiService.get('/test');

        expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' })
        }));
        expect(result).toEqual(mockResponse);
    });

    it('should handle errors correctly', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
            json: async () => ({ message: 'Custom Error' }),
        });

        await expect(ApiService.get('/test')).rejects.toThrow('Custom Error');
    });
});
