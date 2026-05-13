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

  /** GET /api/v1/past-topics-summary */
  getPastTopicsSummary: () => request('/past-topics-summary'),

  /** GET /api/v1/content/:id */
  getContent: (videoId) => request(`/content/${videoId}`),

  /** GET /api/v1/channel-profile */
  getChannelProfile: () => request('/channel-profile'),

  /** PUT /api/v1/channel-profile */
  updateChannelProfile: (payload = {}) =>
    request('/channel-profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  /** GET /api/v1/channel-profiles */
  getChannelProfiles: () => request('/channel-profiles'),

  /** POST /api/v1/channel-profiles */
  createChannelProfile: (payload = {}) =>
    request('/channel-profiles', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** PUT /api/v1/channel-profiles/:id */
  updateChannelProfileById: (id, payload = {}) =>
    request(`/channel-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  /** DELETE /api/v1/channel-profiles/:id */
  deleteChannelProfile: (id) =>
    request(`/channel-profiles/${id}`, {
      method: 'DELETE',
    }),

  /** POST /api/v1/generate */
  generate: (params = {}) =>
    request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        category: params.category || null,
        num_topics: params.numTopics || 5,
        script_type: params.scriptType || 'descriptive',
        channel_profile_id: params.channelProfileId || null,
      }),
    }),

  /** GET /api/v1/generate/stream */
  generateStream: (params, onMessage, onError, onComplete) => {
    const url = new URL(`${BASE_URL}/generate/stream`, window.location.origin);
    if (params.category) url.searchParams.append('category', params.category);
    url.searchParams.append('num_topics', params.numTopics || 5);
    url.searchParams.append('script_type', params.scriptType || 'descriptive');
    if (params.channelProfileId) url.searchParams.append('channel_profile_id', params.channelProfileId);

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
