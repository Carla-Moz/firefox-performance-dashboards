import fetchWrapper from '../utils/fetchWrapper';

// eslint-disable-next-line global-require
jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());

const fetchMock = require('node-fetch');

describe('fetchWrapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  class Response {
    constructor(body) {
      this.body = body;
    }

    clone() {
      return { ...this };
    }
  }

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should call fetch if the promise is not in cache', () => {
    fetchMock.mock('http://example.com/', 200);
    fetchWrapper('http://example.com');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should get the promise from cache', () => {
    fetchMock.mock('http://example2.com/', 200);
    fetchWrapper('http://example2.com');
    fetchWrapper('http://example2.com');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should resolves with a cloned Response object', () => {
    const mockResponse = new Response('foo');
    fetchMock.mock('http://example3.com', Promise.resolve(mockResponse));
    return fetchWrapper('http://example3.com').then((res) => {
      expect(res).not.toBe(mockResponse);
    });
  });

  it('should remove the promise from cache when rejected', () => {
    fetchMock.mock('http://example4.com', { throw: new Error('Error') });
    return fetchWrapper('http://example4.com').catch(() => {
      fetchWrapper('http://example4.com');
      // eslint-disable-next-line jest/no-conditional-expect
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
