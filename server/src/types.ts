export interface WidgetConfig {
  api_base_url: string;
  app_name: string;
  support_email: string;
  widget_tag_name: string;
  available_pages: string;
  available_roles: string;
  default_role: string;
  default_page: string;
  welcome_title: string;
  welcome_subtitle: string;
  color_primary: string;
  color_secondary: string;
}

export interface BuildConfig {
  build_id: string;
  widget: WidgetConfig;
}

export const WIDGET_REQUIRED_FIELDS: (keyof WidgetConfig)[] = [
  'api_base_url',
  'app_name',
  'support_email',
  'widget_tag_name',
  'available_pages',
  'available_roles',
  'default_role',
  'default_page',
  'welcome_title',
  'welcome_subtitle',
  'color_primary',
  'color_secondary',
];