import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

export const useAccelerometer = (onFlipUp: () => void, onFlipDown: () => void) => {
  const [subscription, setSubscription] = useState(null);
  const [phoneFlipped, setPhoneFlipped] = useState(false);
  const [lastFlipState, setLastFlipState] = useState(false);

  const startAccelerometer = async () => {
    try {
      await Accelerometer.setUpdateInterval(300);
      
      const subscription = Accelerometer.addListener(accelerometerData => {
        const { z } = accelerometerData;
        const newFlipState = z > 0.7;
        
        if (newFlipState !== lastFlipState) {
          if (newFlipState) {
            setPhoneFlipped(true);
            onFlipUp();
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          } else {
            setPhoneFlipped(false);
            onFlipDown();
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          }
          setLastFlipState(newFlipState);
        }
      });
      
      setSubscription(subscription);
    } catch (error) {
      console.error('Failed to start accelerometer:', error);
    }
  };

  useEffect(() => {
    startAccelerometer();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { phoneFlipped };
}; 