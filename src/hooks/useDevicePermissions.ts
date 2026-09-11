import { useState, useEffect, useCallback } from 'react';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface DevicePermissionsState {
  camera: PermissionState;
  microphone: PermissionState;
  location: PermissionState;
  notifications: PermissionState;
  lastChecked: number;
}

export function useDevicePermissions() {
  const [permissions, setPermissions] = useState<DevicePermissionsState>(() => {
    // Initial state with local preference fallback
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nexa_device_permissions') : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      camera: 'prompt',
      microphone: 'prompt',
      location: 'prompt',
      notifications: typeof window !== 'undefined' && 'Notification' in window 
        ? (Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt')
        : 'unsupported',
      lastChecked: Date.now(),
    };
  });

  // Query browser permissions API where available
  const queryPermissions = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.permissions) return;

    try {
      // 1. Geolocation
      try {
        const geoStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissions((prev) => ({ ...prev, location: geoStatus.state as PermissionState }));
        geoStatus.onchange = () => {
          setPermissions((prev) => ({ ...prev, location: geoStatus.state as PermissionState }));
        };
      } catch {
        // Some browsers don't support geolocation in query()
      }

      // 2. Camera
      try {
        const camStatus = await navigator.permissions.query({ name: 'camera' as any });
        setPermissions((prev) => ({ ...prev, camera: camStatus.state as PermissionState }));
        camStatus.onchange = () => {
          setPermissions((prev) => ({ ...prev, camera: camStatus.state as PermissionState }));
        };
      } catch {
        // Ignore unsupported query
      }

      // 3. Microphone
      try {
        const micStatus = await navigator.permissions.query({ name: 'microphone' as any });
        setPermissions((prev) => ({ ...prev, microphone: micStatus.state as PermissionState }));
        micStatus.onchange = () => {
          setPermissions((prev) => ({ ...prev, microphone: micStatus.state as PermissionState }));
        };
      } catch {
        // Ignore unsupported query
      }

      // 4. Notifications
      if ('Notification' in window) {
        const notifState = Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt';
        setPermissions((prev) => ({ ...prev, notifications: notifState }));
      } else {
        setPermissions((prev) => ({ ...prev, notifications: 'unsupported' }));
      }
    } catch (e) {
      console.warn('[NEXA Permissions] Query error:', e);
    }
  }, []);

  useEffect(() => {
    queryPermissions();
  }, [queryPermissions]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nexa_device_permissions', JSON.stringify(permissions));
    } catch {
      // ignore
    }
  }, [permissions]);

  // Request Camera
  const requestCamera = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermissions((prev) => ({ ...prev, camera: 'unsupported' }));
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Release stream immediately after test
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, camera: 'granted' }));
      return true;
    } catch (err: any) {
      console.warn('[NEXA Permissions] Camera request denied or failed:', err);
      setPermissions((prev) => ({ ...prev, camera: 'denied' }));
      return false;
    }
  }, []);

  // Request Microphone
  const requestMicrophone = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermissions((prev) => ({ ...prev, microphone: 'unsupported' }));
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev) => ({ ...prev, microphone: 'granted' }));
      return true;
    } catch (err: any) {
      console.warn('[NEXA Permissions] Microphone request denied or failed:', err);
      setPermissions((prev) => ({ ...prev, microphone: 'denied' }));
      return false;
    }
  }, []);

  // Request Notifications
  const requestNotifications = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissions((prev) => ({ ...prev, notifications: 'unsupported' }));
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      const state: PermissionState = result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt';
      setPermissions((prev) => ({ ...prev, notifications: state }));
      return state === 'granted';
    } catch (err) {
      console.warn('[NEXA Permissions] Notification request error:', err);
      return false;
    }
  }, []);

  // Manually update permission toggle
  const setPermissionToggle = useCallback((type: 'camera' | 'microphone' | 'location' | 'notifications', state: PermissionState) => {
    setPermissions((prev) => ({ ...prev, [type]: state }));
  }, []);

  return {
    permissions,
    queryPermissions,
    requestCamera,
    requestMicrophone,
    requestNotifications,
    setPermissionToggle,
  };
}
