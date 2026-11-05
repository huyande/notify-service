import { AppConfig } from './app-config.interface';
import { AppRegistry } from './app.registry';

describe('AppRegistry', () => {
  const configs: AppConfig[] = [
    {
      appId: 'wx1',
      name: 'A',
      secret: 's1',
      callback: { url: 'https://a.example.com/cb' },
    },
    { appId: 'wx2', name: 'B', secret: 's2' },
  ];
  const registry = new AppRegistry(configs);

  it('get returns config by appId', () => {
    expect(registry.get('wx1')?.name).toBe('A');
    expect(registry.get('missing')).toBeUndefined();
  });

  it('has reflects registered apps', () => {
    expect(registry.has('wx2')).toBe(true);
    expect(registry.has('wx3')).toBe(false);
  });

  it('resolveCallbackUrl prefers request url then app config', () => {
    expect(
      registry.resolveCallbackUrl('wx1', 'https://req.example.com/cb'),
    ).toBe('https://req.example.com/cb');
    expect(registry.resolveCallbackUrl('wx1')).toBe('https://a.example.com/cb');
    expect(registry.resolveCallbackUrl('wx2')).toBeUndefined();
  });
});
