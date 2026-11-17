// Mobile & Desktop Push Notification Dispatcher for MedNest Guardian

import { hapticFeedback } from './haptics';

export interface InAppToastPayload {
  id: string;
  title: string;
  body: string;
  type: 'emergency' | 'success' | 'warning' | 'info';
  timestamp: string;
  url?: string;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        hapticFeedback.success();
        return true;
      }
    } catch {
      return false;
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
    type?: 'emergency' | 'success' | 'warning' | 'info';
  }
) {
  // 1. Haptic feedback
  if (options.alarm) {
    hapticFeedback.alarm();
  } else {
    hapticFeedback.medium();
  }

  // 2. Dispatch custom in-app banner/toast event so user ALWAYS sees confirmation
  if (typeof window !== 'undefined') {
    const toastDetail: InAppToastPayload = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      body: options.body,
      type: options.type || (options.alarm ? 'emergency' : options.tag?.includes('safe') || options.tag?.includes('ack') ? 'success' : 'info'),
      timestamp: new Date().toLocaleTimeString(),
      url: options.url,
    };
    window.dispatchEvent(new CustomEvent('mednest-toast', { detail: toastDetail }));
  }

  if (!isNotificationSupported()) {
    return;
  }

  // 3. Prompt for browser permission if not yet decided
  if (Notification.permission === 'default') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  } else if (Notification.permission !== 'granted') {
    return;
  }

  // 4. Trigger system push notification (safely without hanging on serviceWorker)
  try {
    let handled = false;

    // Check if an active service worker is ready with a quick timeout
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((r) => setTimeout(() => r(null), 200)),
      ]);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/icon-192x192.png',
          tag: options.tag || 'mednest-alert',
          requireInteraction: options.requireInteraction ?? false,
          data: { url: options.url || '/dashboard' },
        });
        handled = true;
      }
    }

    if (!handled && typeof Notification !== 'undefined') {
      const notif = new Notification(title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        tag: options.tag || 'mednest-alert',
        requireInteraction: options.requireInteraction ?? false,
      });
      notif.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
      };
    }
  } catch (err) {
    console.warn('[Notification] Failed to trigger system notification:', err);
  }
}

export async function triggerAlertAcknowledged(responderName = 'Caregiver') {
  await sendLocalNotification('✅ Emergency Alert Acknowledged', {
    body: `${responderName} has acknowledged the emergency alert and is currently assisting the patient.`,
    tag: 'sos-acknowledged',
    alarm: false,
    requireInteraction: false,
    url: '/dashboard',
    type: 'success',
  });
}

export async function triggerPatientSafeConfirmation() {
  await sendLocalNotification('🟢 Patient Safe (Alarm Cancelled)', {
    body: 'Patient clicked "I\'m OK". False alarm has been safely cancelled.',
    tag: 'sos-safe',
    alarm: false,
    requireInteraction: false,
    url: '/dashboard',
    type: 'success',
  });
}

export async function triggerUnresponsiveSosAlarm(
  location = 'Smart Bed Chamber 1',
  vitals = 'HR: 142 BPM, SpO2: 91%'
) {
  await sendLocalNotification('🚨 CRITICAL: Unresponsive Patient Emergency!', {
    body: `Patient did not respond to countdown! GPS Location: ${location}. Vitals: ${vitals}. Dispatching emergency response!`,
    tag: 'sos-unresponsive',
    requireInteraction: true,
    alarm: true,
    url: '/emergency',
    type: 'emergency',
  });
}

// Pre-built notification triggers for Guardian & Patient
export async function triggerBedExitAlarm(patientName = 'Patient') {
  await sendLocalNotification('🚨 Bed Departure Alert', {
    body: `${patientName} has departed from the smart pillow/bed at an unexpected time.`,
    tag: 'bed-exit',
    requireInteraction: true,
    alarm: true,
    url: '/monitoring',
    type: 'warning',
  });
}

export async function triggerVitalSpikeAlarm(metric: 'Heart Rate' | 'SpO2' | 'Temperature', value: string | number) {
  await sendLocalNotification(`⚠️ Critical Vital Alert: ${metric}`, {
    body: `Abnormal reading detected: ${metric} is currently ${value}. Immediate review recommended.`,
    tag: 'vital-alert',
    requireInteraction: true,
    alarm: true,
    url: '/monitoring',
    type: 'warning',
  });
}

export async function triggerMedicationAlert(medicationName: string, dosage: string) {
  await sendLocalNotification('💊 Medication Due', {
    body: `Scheduled dosage of ${medicationName} (${dosage}) is due now.`,
    tag: 'medication',
    alarm: false,
    url: '/medications',
    type: 'info',
  });
}
