import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    tax_percentage: '10',
    service_charge: '0',
    currency: 'IDR',
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
  });

  useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((res) => {
      const newSettings: any = {};
      res.data.forEach((s: any) => { newSettings[s.key] = s.value; });
      setSettings({ ...settings, ...newSettings });
    }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof settings) =>
      Promise.all(
        Object.entries(data).map(([key, value]) =>
          api.post('/settings', { key, value })
        )
      ),
    onSuccess: () => toast.success('Settings saved'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-japanese-charcoal">Settings</h1>
        <p className="text-gray-500">System configuration</p>
      </div>

      <div className="card max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="label">Tax Percentage</label>
            <input
              type="number"
              value={settings.tax_percentage}
              onChange={(e) => setSettings({ ...settings, tax_percentage: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Service Charge (%)</label>
            <input
              type="number"
              value={settings.service_charge}
              onChange={(e) => setSettings({ ...settings, service_charge: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Receipt Footer</label>
            <textarea
              value={settings.receipt_footer}
              onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
              className="input"
              rows={3}
            />
          </div>
          <button
            onClick={() => saveMutation.mutate(settings)}
            disabled={saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
