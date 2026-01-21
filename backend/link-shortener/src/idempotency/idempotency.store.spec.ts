import { IdempotencyStore } from './idempotency.store';

describe('IdempotencyStore', () => {
  let store: IdempotencyStore;

  beforeEach(() => {
    store = new IdempotencyStore();
  });

  afterEach(() => {
    store.clear();
  });

  describe('get/set', () => {
    it('should store and retrieve a response', () => {
      const key = 'test-key-123';
      const response = { hash: 'abc123' };

      store.set(key, response);
      const retrieved = store.get(key);

      expect(retrieved).toEqual(response);
    });

    it('should return undefined for non-existent key', () => {
      const retrieved = store.get('non-existent-key');
      expect(retrieved).toBeUndefined();
    });

    it('should return same hash for same idempotency key', () => {
      const idempotencyKey = 'unique-request-id';
      const firstResponse = { hash: 'first-hash' };

      store.set(idempotencyKey, firstResponse);

      const secondRetrieval = store.get(idempotencyKey);
      const thirdRetrieval = store.get(idempotencyKey);

      expect(secondRetrieval).toEqual(firstResponse);
      expect(thirdRetrieval).toEqual(firstResponse);
      expect(secondRetrieval).toBe(thirdRetrieval);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      store.set('existing-key', { data: 'test' });
      expect(store.has('existing-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(store.has('non-existent-key')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      store.set('key1', { data: '1' });
      store.set('key2', { data: '2' });

      store.clear();

      expect(store.has('key1')).toBe(false);
      expect(store.has('key2')).toBe(false);
    });
  });
});
