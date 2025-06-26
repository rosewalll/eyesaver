import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { format } from 'date-fns';

const eyeDropSchedule = [
  { name: '싸이포린엔', interval: 4 * 60, repeat: 4, delay: 0 },
  { name: '프레드포르테', interval: 2 * 60, repeat: 6, delay: 10 },
  { name: '크라비트', interval: 8 * 60, repeat: 2, delay: 25 },
];

const oralSchedule = [
  { name: '내복약 A (1일 3회)', interval: 6 * 60, repeat: 3, delay: 15 },
  { name: '혈압약 등 (1일 1회)', interval: 24 * 60, repeat: 1, delay: 5 },
];

function formatTime(minutesFromWake, wakeTime) {
  const total = wakeTime.getTime() + minutesFromWake * 60 * 1000;
  const date = new Date(total);
  return format(date, 'HH:mm');
}

async function scheduleNotification(title, body, minutesFromNow) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds: minutesFromNow * 60 },
  });
}

export default function App() {
  const [wakeTime, setWakeTime] = useState(null);
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    (async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('알림 권한이 필요합니다');
        }
      } else {
        Alert.alert('실제 기기에서만 작동합니다');
      }
    })();
  }, []);

  const handleWakeUp = () => {
    const now = new Date();
    setWakeTime(now);
    setScheduled(false);
  };

  const handleSchedule = () => {
    if (!wakeTime) return;
    [...eyeDropSchedule, ...oralSchedule].forEach((med) => {
      for (let i = 0; i < med.repeat; i++) {
        const totalDelay = med.delay + i * med.interval;
        scheduleNotification(
          `${med.name} 알림`,
          `지금 ${med.name} 복용/점안할 시간이에요!`,
          totalDelay
        );
      }
    });
    setScheduled(true);
    Alert.alert('오늘 복약 알림이 설정되었습니다');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>복약 스케줄러</Text>
      {!wakeTime ? (
        <Button title='지금 기상했어요' onPress={handleWakeUp} />
      ) : (
        <View>
          <Text style={{ marginVertical: 10 }}>
            기상 시간: {format(wakeTime, 'HH:mm')}
          </Text>
          <Button title='복약 알림 예약하기' onPress={handleSchedule} disabled={scheduled} />
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>점안약</Text>
          {eyeDropSchedule.map((med, i) => (
            <View key={i} style={{ marginVertical: 10 }}>
              <Text style={{ fontWeight: '600' }}>{med.name}</Text>
              {[...Array(med.repeat)].map((_, idx) => (
                <Text key={idx}>- {formatTime(med.delay + idx * med.interval, wakeTime)} 예정</Text>
              ))}
            </View>
          ))}
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>먹는약</Text>
          {oralSchedule.map((med, i) => (
            <View key={i} style={{ marginVertical: 10 }}>
              <Text style={{ fontWeight: '600' }}>{med.name}</Text>
              {[...Array(med.repeat)].map((_, idx) => (
                <Text key={idx}>- {formatTime(med.delay + idx * med.interval, wakeTime)} 예정</Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
