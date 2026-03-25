import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.matchMedia (required by Ant Design's useBreakpoint / Grid)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '', pathname: '/', assign: () => {} },
});

// Silence known Ant Design deprecation warnings in tests
const originalWarn = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = args[0]?.toString() || '';
  if (msg.includes('labelStyle is deprecated') || msg.includes('Warning:')) return;
  originalWarn(...args);
};
