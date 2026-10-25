// Haptic feedback utility for mobile PWA interactions

export const hapticFeedback = {
  // Gentle tap for button presses and navigation
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  // Medium vibration for selections and toggles
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },

  // Strong vibration for warnings or confirmation
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 20]);
    }
  },

  // Emergency SOS warning vibration pattern
  alarm: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  },
};
