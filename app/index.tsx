import { StyleSheet, View } from 'react-native';
import PomodoroTimer from './components/PomodoroTimer';

export default function Index() {
  return (
    <View style={styles.container}>
      <PomodoroTimer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 确保与 PomodoroTimer 背景色一致
  },
});