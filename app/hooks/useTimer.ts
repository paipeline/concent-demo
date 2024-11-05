import { useState, useEffect } from 'react';

export const useTimer = (isStudying: boolean) => {
  const [time, setTime] = useState(0);
  const [savedTimes, setSavedTimes] = useState<number[]>([]);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStudying && !isTimerActive) {
      setIsTimerActive(true);
    }
    
    if (isTimerActive && isStudying) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStudying, isTimerActive]);

  const saveTime = () => {
    if (time > 0) {
      setSavedTimes(prev => [...prev, time]);
      setTime(0);
      setIsTimerActive(false); // 重置计时器状态
    }
  };

  return { time, savedTimes, saveTime };
}; 