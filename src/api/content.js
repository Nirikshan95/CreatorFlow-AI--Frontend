const BASE_URL = '/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const contentApi = {
  /** GET /api/v1/history */
  getHistory: () => request('/history'),

  /** GET /api/v1/past-topics */
  getPastTopics: () => request('/past-topics'),

  /** GET /api/v1/content/:id */
  getContent: (videoId) => request(`/content/${videoId}`),

  /** POST /api/v1/generate */
  generate: (params = {}) =>
    request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        category: params.category || null,
        num_topics: params.numTopics || 5,
      }),
    }),

  /** GET /api/v1/generate/stream */
  generateStream: (params, onMessage, onError, onComplete) => {
    const url = new URL(`${BASE_URL}/generate/stream`, window.location.origin);
    if (params.category) url.searchParams.append('category', params.category);
    url.searchParams.append('num_topics', params.numTopics || 5);

    const eventSource = new EventSource(url.toString());

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.step === 'error') {
          onError(data.message);
          eventSource.close();
        } else if (data.step === 'final') {
          onComplete(data.data);
          eventSource.close();
        } else {
          onMessage(data);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    eventSource.onerror = (err) => {
      onError('Connection to generation stream lost.');
      eventSource.close();
    };

    return () => eventSource.close();
  },
};

