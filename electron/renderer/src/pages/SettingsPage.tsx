import React, { useEffect, useState } from 'react';
import { fetchSettings, saveSettings } from '../services/settingsService';

const SettingsPage = ({ userId }: { userId: string }) => {
  const [settings, setSettings] = useState<{ key: string; label: string; value: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSettings(userId);
      setSettings(data.map((item: any) => ({
        key: item.key,
        label: item.label,
        value: Boolean(item.value),
      })));
    };

    if (userId) loadSettings();
  }, [userId]);

  const handleToggle = (key: string) => {
    setSettings((current) => current.map((item) => item.key === key ? { ...item, value: !item.value } : item));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const preferences = settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
    await saveSettings(userId, preferences);
    setSaving(false);
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        {settings.map((setting) => (
          <label key={setting.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">{setting.label}</span>
            <button
              type="button"
              onClick={() => handleToggle(setting.key)}
              className={`h-9 w-16 rounded-full transition ${setting.value ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`block h-8 w-8 rounded-full bg-white shadow-sm transition ${setting.value ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </label>
        ))}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;