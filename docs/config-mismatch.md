# Dashboard Config Payload Mismatch

## Problem

Dashboard sends config with `VITE_` prefix keys, but backend expects non-prefixed keys.

### Dashboard State (current)
```javascript
{
  "VITE_APP_NAME": "My App",
  "VITE_SUPPORT_EMAIL": "support@example.com",
  "VITE_WIDGET_TAG_NAME": "cortex-chat-widget",
  "VITE_AVAILABLE_PAGES": "home,support",
  "VITE_COLOR_PRIMARY": "#2B3D55",
  ...
}
```

### Backend Expects (TenantUIConfigSerializer)
```json
{
  "app_name": "My App",
  "support_email": "support@example.com",
  "widget_tag_name": "cortex-chat-widget",
  "available_pages": "home,support",
  "color_primary": "#2B3D55",
  ...
}
```

## Affected Endpoint

- **PUT** `/api/v1/admin/tenant-ui-config`
- **GET** `/api/v1/admin/tenant-ui-config`

## Root Cause

Dashboard was originally designed to read/write `.env` files directly via `dashboard-server.js` which uses `VITE_` prefix for Vite environment variables.

After migrating to OpenAPI-backed endpoints, the frontend was not updated to strip the `VITE_` prefix before sending payloads.

## Backend Fields (TenantUIConfigSerializer)

| Backend Key | Type |
|-------------|------|
| api_base_url | string |
| app_name | string |
| assistant_name | string |
| available_pages | string |
| available_roles | string |
| chat_button_text | string |
| default_page | string |
| default_role | string |
| default_user_id | string |
| default_user_name | string |
| follow_button_text | string |
| option_prompt | string |
| support_email | string |
| welcome_subtitle | string |
| welcome_title | string |
| widget_tag_name | string |
| color_primary | string (optional) |
| color_secondary | string (optional) |

## Dashboard VITE Keys to Backend Mapping

| Dashboard Key (VITE_*) | Backend Key |
|------------------------|-------------|
| VITE_API_BASE_URL | api_base_url |
| VITE_APP_NAME | app_name |
| VITE_ASSISTANT_NAME | assistant_name |
| VITE_AVAILABLE_PAGES | available_pages |
| VITE_AVAILABLE_ROLES | available_roles |
| VITE_CHAT_BUTTON_TEXT | chat_button_text |
| VITE_DEFAULT_PAGE | default_page |
| VITE_DEFAULT_ROLE | default_role |
| VITE_DEFAULT_USER_ID | default_user_id |
| VITE_DEFAULT_USER_NAME | default_user_name |
| VITE_FOLLOW_BUTTON_TEXT | follow_button_text |
| VITE_OPTION_PROMPT | option_prompt |
| VITE_SUPPORT_EMAIL | support_email |
| VITE_WELCOME_SUBTITLE | welcome_subtitle |
| VITE_WELCOME_TITLE | welcome_title |
| VITE_WIDGET_TAG_NAME | widget_tag_name |
| VITE_COLOR_PRIMARY | color_primary |
| VITE_COLOR_SECONDARY | color_secondary |

## Status

- [x] GET tenant-ui-config (working - backend returns non-prefixed keys, dashboard stores as-is)
- [ ] PUT tenant-ui-config (fails - sending VITE_* keys instead of proper keys)

## Solution

Transform keys in `saveConfig()`:
- Strip `VITE_` prefix from keys
- Map to exact backend field names

## Files Affected

- `src/dashboard/hooks/useConfig.ts` - saveConfig function needs key transformation