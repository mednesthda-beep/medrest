// Mobile & Desktop Push Notification Dispatcher for MedNest Guardian

import { hapticFeedback } from './haptics';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      hapticFeedback.success();
      return true;
    }
  }

  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function sendLocalNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    requireInteraction?: boolean;
    alarm?: boolean;
  }
) {
  if (options.alarm) {
    hapticFeedback.alarm();
  } else {
    hapticFeedback.medium();
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/icon-192x192.png',
          tag: options.tag || 'mednest-alert',
          requireInteraction: options.requireInteraction ?? false,
          data: { url: options.url || '/dashboard' },
        });
        return;
      }
    }

    // Fallback to standard Notification API
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      tag: options.tag || 'mednest-alert',
    });
  } catch (err) {
    console.warn('[Notification] Failed to trigger notification:', err);
  }
}

// Pre-built notification triggers for Guardian & Patient
export async function triggerBedExitAlarm(patientName = 'Patient') {
  await sendLocalNotification('🚨 Bed Departure Alert', {
    body: `${patientName} has departed from the smart pillow/bed at an unexpected time.`,
    tag: 'bed-exit',
    requireInteraction: true,
    alarm: true,
    url: '/monitoring',
  });
}

export async function triggerVitalSpikeAlarm(metric: 'Heart Rate' | 'SpO2' | 'Temperature', value: string | number) {
  await sendLocalNotification(`⚠️ Critical Vital Alert: ${metric}`, {
    body: `Abnormal reading detected: ${metric} is currently ${value}. Immediate review recommended.`,
    tag: 'vital-alert',
    requireInteraction: true,
    alarm: true,
    url: '/monitoring',
  });
}

export async function triggerMedicationAlert(medicationName: string, dosage: string) {
  await sendLocalNotification('💊 Medication Due', {
    body: `Scheduled dosage of ${medicationName} (${dosage}) is due now.`,
    tag: 'medication',
    alarm: false,
    url: '/medications',
  });
}
