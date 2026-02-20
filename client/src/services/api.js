import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds (Ollama can be slow on first request)
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;
const RETRYABLE_STATUS = [502, 503, 504];

// Error interceptor with retry logic for transient failures
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config || config._retryCount >= MAX_RETRIES) {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }

    const isRetryable =
      !error.response || // Network error (no response at all)
      RETRYABLE_STATUS.includes(error.response.status);

    if (!isRetryable) {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    }

    config._retryCount = (config._retryCount || 0) + 1;
    const delay = RETRY_DELAY * config._retryCount;
    console.warn(`API retry ${config._retryCount}/${MAX_RETRIES} after ${delay}ms:`, config.url);

    await new Promise((resolve) => setTimeout(resolve, delay));
    return apiClient(config);
  }
);

export const startInterview = (data) => {
  return apiClient.post('/api/interviews/start', data);
};

export const submitAnswer = (sessionId, data) => {
  return apiClient.post(`/api/interviews/${sessionId}/answer`, data);
};

export const endInterview = (sessionId) => {
  return apiClient.post(`/api/interviews/${sessionId}/end`);
};

export const getReport = (reportId) => {
  return apiClient.get(`/api/reports/${reportId}`);
};

export const checkOllamaHealth = () => {
  return apiClient.get('/api/health/ollama');
};
