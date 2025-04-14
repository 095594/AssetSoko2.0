import '@testing-library/jest-dom';

// Mock window.userId for tests
window.userId = 1;

// Mock Pusher and Laravel Echo
const mockEcho = {
  private: jest.fn().mockReturnThis(),
  listen: jest.fn().mockReturnThis(),
  leave: jest.fn()
};

window.Echo = {
  private: mockEcho.private,
  listen: mockEcho.listen,
  leave: mockEcho.leave
};

// Mock route function
window.route = jest.fn((name, params) => {
  return `/mock-route/${name}/${params ? JSON.stringify(params) : ''}`;
});

// Mock process.env
process.env.MIX_PUSHER_APP_KEY = 'test-key';
process.env.MIX_PUSHER_APP_CLUSTER = 'test-cluster';
