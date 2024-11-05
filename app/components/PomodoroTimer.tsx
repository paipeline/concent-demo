import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  Animated, 
  Dimensions 
} from 'react-native';
import TodoNavbar from './TodoNavbar';
import { Accelerometer } from 'expo-sensors';
import { useTimer } from '../hooks/useTimer';
import { useAccelerometer } from '../hooks/useAccelerometer';

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

export default function PomodoroTimer() {
  const [isStudying, setIsStudying] = useState(false);
  const { time, savedTimes, saveTime } = useTimer(isStudying);
  const { phoneFlipped } = useAccelerometer(
    () => setIsStudying(true),
    () => {
      if (isStudying) {
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
        {!isStudying && savedTimes.length > 0 && (
          <View style={styles.historyContainer}>
            {savedTimes.map((savedTime, index) => (
              <Text key={index} style={styles.historyText}>
                第{index + 1}次: {formatTime(savedTime)}
              </Text>
            ))}
          </View>
        )}
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
}); 