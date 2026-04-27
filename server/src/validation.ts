import { WIDGET_REQUIRED_FIELDS } from './types.js';

export function validateBuildId(buildId: unknown): string | null {
  if (!buildId || typeof buildId !== 'string' || !/^[a-f0-9-]{36}$/i.test(buildId)) {
    return null;
  }
  return buildId;
}

export function validateWidgetConfig(config: unknown): import('./types.js').WidgetConfig | null {
  if (!config || typeof config !== 'object' || config === null) {
    return null;
  }
  for (const field of WIDGET_REQUIRED_FIELDS) {
    if (!(field in config) || typeof (config as Record<string, unknown>)[field] !== 'string') {
      return null;
    }
  }
  return config as import('./types.js').WidgetConfig;
}
