// Notification sound utility - Uber-like ping sound
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

let audioInstance: HTMLAudioElement | null = null;

export const playNotificationSound = () => {
  try {
    if (!audioInstance) {
      audioInstance = new Audio(NOTIFICATION_SOUND_URL);
      audioInstance.volume = 0.7;
    }
    audioInstance.currentTime = 0;
    audioInstance.play().catch(console.error);
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};

export const vibrateDevice = () => {
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  
  return false;
};

export const showBrowserNotification = (title: string, body: string, onClick?: () => void) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "nova-aula",
      requireInteraction: true,
    });
    
    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }
  }
};

export const updateBrowserBadge = (count: number) => {
  if ("setAppBadge" in navigator) {
    if (count > 0) {
      (navigator as any).setAppBadge(count);
    } else {
      (navigator as any).clearAppBadge();
    }
  }
  // Update document title as fallback
  const baseTitle = "CNH360";
  document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
};
