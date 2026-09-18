import { t } from './i18n';
import type { Device, Period, Snapshot } from './types';
const start = Date.now();
export const demoDevices: Device[] = [
  { id: 'WSL-001', name: 'حساس البيت البلاستيكي', model: 'ESP32 · DHT22', project: 'الزراعة الذكية', location: 'دمشق', status: 'online', value: 26.4, unit: '°C', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-002', name: 'مراقب خط الإنتاج', model: 'STM32 · Industrial', project: 'مراقبة المصنع', location: 'حلب', status: 'online', value: 1420, unit: 'rpm', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-003', name: 'عداد الطاقة الشمسية', model: 'ESP32 · PZEM-004T', project: 'الطاقة الشمسية', location: 'حمص', status: 'online', value: 3.8, unit: 'kW', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-004', name: 'متحكم خزان المياه', model: 'ESP8266 · Ultrasonic', project: 'الزراعة الذكية', location: 'دمشق', status: 'warning', value: 18, unit: '%', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-005', name: 'حساس بيئة المختبر', model: 'Raspberry Pi · BME280', project: 'المختبر الجامعي', location: 'اللاذقية', status: 'online', value: 24.1, unit: '°C', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-006', name: 'حساس غرفة التبريد', model: 'ESP32 · DS18B20', project: 'مراقبة المصنع', location: 'حلب', status: 'offline', value: 4.2, unit: '°C', protocol: 'HTTP', lastSeen: start - 7200000, demo: true },
  { id: 'WSL-007', name: 'حساس رطوبة التربة', model: 'ESP32 · Capacitive', project: 'الزراعة الذكية', location: 'دمشق', status: 'online', value: 62, unit: '%', protocol: 'HTTP', lastSeen: start, demo: true },
  { id: 'WSL-008', name: 'مراقب العاكس الشمسي', model: 'ESP32 · Modbus bridge', project: 'الطاقة الشمسية', location: 'حمص', status: 'online', value: 97.2, unit: '%', protocol: 'HTTP', lastSeen: start, demo: true },
];
export function demoSnapshot(period: Period): Snapshot {
  const duration = { '1h': 3600000, '24h': 86400000, '7d': 604800000 }[period];
  return {
    devices: demoDevices.map(d => ({ ...d, name:t(d.name), project:t(d.project), location:t(d.location) })), points: 8426,
    activity: [21,24,22,28,25,24,32,29,36,31,28,39,43,35,38,46,39,41,36,44,40,48,42,46].map((messages,i) => ({ time: start - duration + duration / 24 * i, messages: messages * (period === '7d' ? 7 : 1) })),
    alerts: [
      { id: 'WSL-004', title: t('مستوى المياه أقل من ٢٠٪'), name: t('متحكم خزان المياه'), lastSeen: start },
      { id: 'WSL-006', title: t('توقف الجهاز عن الإرسال'), name: t('حساس غرفة التبريد'), lastSeen: start - 7200000 },
    ],
  };
}
