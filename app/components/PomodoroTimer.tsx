import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  Animated, 
  Dimensions,
  Vibration,
  Image,
} from 'react-native';
import TodoNavbar from './TodoNavbar';
import { Accelerometer } from 'expo-sensors';

// 添加格式化时间函数
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

// 添加 useTimer hook
const useTimer = (isStudying: boolean) => {
  const [time, setTime] = useState(0);
  const [savedTimes, setSavedTimes] = useState<number[]>([]);
  const [overallTime, setOverallTime] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);

  useEffect(() => {
    console.log('Timer Effect - isStudying:', isStudying);
    let interval: NodeJS.Timeout | null = null;
    
    if (isStudying) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          setOverallTime(prev => prev + 1);
          
          if (newTime >= 5) {
            console.log('完成一个番茄！');
            setPomodoroCount(prev => prev + 1);
            Vibration.cancel();
            Vibration.vibrate([200], false);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
      
      console.log('Started interval:', interval);
    }

    return () => {
      if (interval) {
        console.log('Clearing interval:', interval);
        clearInterval(interval);
        interval = null;
      }
    };
  }, [isStudying]);

  const saveTime = useCallback(() => {
    if (time > 0) {
      setSavedTimes(prev => [...prev, time]);
      setTime(0);
    }
  }, [time]);

  return { time: overallTime, savedTimes, saveTime, pomodoroCount };
};

// 添加 useAccelerometer hook
const useAccelerometer = (
  onFlipToBack: () => void,
  onFlipToFront: () => void
) => {
  const [phoneFlipped, setPhoneFlipped] = useState(false);
  const [{ z }, setData] = useState({ z: 0 });

  useEffect(() => {
    let subscription;

    const startAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(500);
        
        subscription = Accelerometer.addListener(accelerometerData => {
          setData(accelerometerData);
          
          const isFlipped = accelerometerData.z > 0.7 ;
          console.log('Z轴:', accelerometerData.z, '是否翻转:', isFlipped);
          
          if (isFlipped !== phoneFlipped) {
            setPhoneFlipped(isFlipped);
            if (isFlipped) {
              console.log('正面朝下，开始学习');
              onFlipToBack();
            } else {
              console.log('正面朝上，停止学习');
              onFlipToFront();
            }
          }
        });
      } catch (error) {
        console.error('加速度计启动失败:', error);
      }
    };

    startAccelerometer();

    return () => {
      subscription?.remove();
    };
  }, [phoneFlipped, onFlipToBack, onFlipToFront]);

  return { phoneFlipped };
};

export default function PomodoroTimer() {
  const [isStudying, setIsStudying] = useState(false);
  console.log('Main component - isStudying:', isStudying);
  
  const { time, savedTimes, saveTime, pomodoroCount } = useTimer(isStudying);
  
  const { phoneFlipped } = useAccelerometer(
    () => {
      console.log('Flip to back - Setting isStudying to true');
      setIsStudying(true);

    },
    () => {
      console.log('Flip to front - Current isStudying:', isStudying);
      if (isStudying) {
        console.log('Stopping study session');
        setIsStudying(false);
        saveTime();
      }
    }
  );
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [translateYAnim] = useState(new Animated.Value(0));

  const renderTimeHistory = () => {
    return (
      <View style={styles.historyContainer}>
        {savedTimes.map((savedTime, index) => (
          <Text key={index} style={styles.historyText}>
            第{index + 1}次: {formatTime(savedTime)}
          </Text>
        ))}
      </View>
    );
  };

  // 动画效果
  useEffect(() => {
    if (isStudying) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: SCREEN_HEIGHT * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isStudying]);

  // 渲染番茄标记
  const renderPomodoroMarkers = () => {
    return (
      <View style={styles.markersContainer}>
        {[...Array(pomodoroCount)].map((_, index) => (
          <View key={index} style={styles.marker}>
            <Text style={styles.markerText}>🍅</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <Text style={[
          styles.timerText,
          isStudying && styles.expandedTimerText
        ]}>
          {formatTime(time)}
        </Text>
        <Text style={[
          styles.statusText,
          isStudying && styles.expandedStatusText
        ]}>
          {isStudying ? '专注学习中...' : '翻转手机开始计时'}
        </Text>
      </View>
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim }
            ],
            opacity: opacityAnim,
          }
        ]}
      >
        {renderPomodoroMarkers()}
      </Animated.View>
      <TodoNavbar phoneFlipped={phoneFlipped} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#673AB7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockContainer: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  expandedTimerText: {
    fontSize: 96,
    color: '#fff',
  },
  statusText: {
    marginTop: 20,
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  expandedStatusText: {
    fontSize: 28,
    color: '#fff',
    marginTop: 30,
  },
  historyContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    width: '90%',
  },
  historyText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  markersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    paddingHorizontal: 10,
    maxWidth: '100%',
  },
  marker: {
    margin: 5,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 24,
  },
}); 