export interface WidgetConfig {
  api_base_url: string;
  widget_tag_name: string;
  available_pages: string;
  default_role: string;
  default_page: string;
  welcome_title: string;
  welcome_subtitle: string;
  color_primary: string;
  color_secondary: string;
  assistant_name: string;
  welcome_prompt: string;
  welcome_chat_btn: string;
}

export interface BuildConfig {
  build_id: string;
  widget: WidgetConfig;
}

export const WIDGET_REQUIRED_FIELDS: (keyof WidgetConfig)[] = [
  'api_base_url',
  'widget_tag_name',
  'available_pages',
  'default_role',
  'default_page',
  'welcome_title',
  'welcome_subtitle',
  'color_primary',
  'color_secondary',
  'assistant_name',
  'welcome_prompt',
  'welcome_chat_btn',
];