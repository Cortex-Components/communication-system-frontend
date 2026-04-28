import type { AiConfig } from '..';

type FieldDef = {
  key?: string;
  id?: string;
  label: string;
  type: string;
  default?: string;
};

interface Props {
  fields: FieldDef[];
  isAiTab: boolean;
  config: Record<string, string>;
  aiConfig: AiConfig;
  onConfigChange: (key: string, value: string) => void;
  onAiChange: (key: keyof AiConfig, value: unknown) => void;
  errors?: Record<string, string>;
}

export function ConfigForm({
  fields,
  isAiTab,
  config,
  aiConfig,
  onConfigChange,
  onAiChange,
  errors = {},
}: Props) {
  const getValue = (key: string) =>
    isAiTab
      ? ((aiConfig[key as keyof AiConfig] as string) ?? '')
      : (config[key] ?? '');

  const handleChange = (key: string, value: string) => {
    if (isAiTab) onAiChange(key as keyof AiConfig, value);
    else onConfigChange(key, value);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {fields.map((field, idx) => {
        if (field.type === 'divider') {
          return (
            <div key={`div-${idx}`} className="pt-8 pb-2 border-b border-slate-100 mb-4">
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em]">
                {field.label}
              </h4>
            </div>
          );
        }

        const key = field.key!;
        const value = getValue(key);
        const error = errors[key];

        return (
          <div key={key ?? idx} className="space-y-3 group">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {field.label}
                  </label>
                  {isAiTab && <div className="w-1 h-1 rounded-full bg-indigo-400" />}
                  {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{key}</p>
              </div>
            </div>

            <div className="relative">
              {field.type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={isAiTab ? (key === 'brand_voice_rules' ? 8 : 4) : 3}
                  className={`w-full px-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-300 shadow-inner group-hover:bg-white ${error ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder={field.default ?? `Specify ${field.label.toLowerCase()}...`}
                />
              ) : field.type === 'color' ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-slate-200">
                    <input
                      type="color"
                      value={value || field.default || '#000000'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={value || field.default || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={`flex-1 px-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-mono uppercase tracking-widest text-sm shadow-inner group-hover:bg-white ${error ? 'border-red-400' : 'border-slate-200'}`}
                    placeholder="#000000"
                  />
                </div>
              ) : (
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`w-full px-5 py-4 bg-slate-50/50 border rounded-[1.5rem] focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner group-hover:bg-white ${error ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder={field.default ?? `Specify ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
