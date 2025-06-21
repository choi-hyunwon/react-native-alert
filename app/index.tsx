import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  fetchBinancePrice,
  fetchUpbitPrice,
  getExchangeRate,
} from '../src/api/cryptoAPI';

// 1. 알림 핸들러 설정 (앱이 실행 중일 때도 알림을 표시)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [upbitPrice, setUpbitPrice] = useState<number | null>(null);
  const [binancePrice, setBinancePrice] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [kimchiPremium, setKimchiPremium] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. 알림 보내는 함수
  const schedulePushNotification = async (premium: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "김치 프리미엄 업데이트 🚀",
        body: `현재 김치 프리미엄은 ${premium}% 입니다.`,
      },
      trigger: null, // 즉시 발송
    });
  }

  // 3. 알림 권한 요청 함수
  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('알림 권한이 거부되었습니다!', '알림 기능을 사용하려면 설정에서 권한을 허용해주세요.');
      return;
    }
  }

  const calculatePremium = (krw: number, usd: number, rate: number) => {
    if (krw && usd && rate) {
      const premium = (((krw / (usd * rate)) - 1) * 100).toFixed(2);
      setKimchiPremium(premium);
      // 4. 프리미엄 계산 후 알림 호출
      schedulePushNotification(premium);
    }
  };

  const loadData = async () => {
    // 최초 로딩 시에만 로딩 인디케이터 표시
    if (loading) {
        // 이 부분은 그대로 두어 최초 실행 시에만 true가 되도록 함
    } else {
        // 자동 갱신 시에는 백그라운드에서 조용히 실행
    }
    
    try {
      setError(null);
      const [krw, usd, rate] = await Promise.all([
        fetchUpbitPrice(),
        fetchBinancePrice(),
        getExchangeRate(),
      ]);

      setUpbitPrice(krw);
      setBinancePrice(usd);
      setExchangeRate(rate);
      calculatePremium(krw, usd, rate);
    } catch (e) {
      setError('데이터를 불러오는 데 실패했습니다.');
      console.error(e);
    } finally {
      if(loading) setLoading(false);
    }
  };

  useEffect(() => {
    // 5. 앱 시작 시 알림 권한 요청 및 초기 데이터 로드
    registerForPushNotificationsAsync();
    loadData();

    // 6. 3분(180000ms)마다 자동 갱신 설정
    const interval = setInterval(() => {
      console.log("3분마다 데이터 자동 갱신 실행");
      loadData();
    }, 180000);

    // 7. 컴포넌트가 사라질 때 인터벌 정리 (메모리 누수 방지)
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비트코인 김치 프리미엄</Text>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.dataRow}>
            <Text style={styles.label}>업비트 (KRW)</Text>
            <Text style={styles.value}>{upbitPrice?.toLocaleString()}원</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>바이낸스 (USD)</Text>
            <Text style={styles.value}>${binancePrice?.toLocaleString()}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.label}>환율 (USD/KRW)</Text>
            <Text style={styles.value}>{exchangeRate?.toLocaleString()}원</Text>
          </View>

          <View style={styles.premiumContainer}>
            <Text style={styles.premiumLabel}>김치 프리미엄</Text>
            <Text style={styles.premiumValue}>{kimchiPremium}%</Text>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={loadData}
          disabled={loading}>
          <Text style={styles.buttonText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 18,
    color: '#555',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
  },
  premiumContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  premiumLabel: {
    fontSize: 20,
    color: '#888',
  },
  premiumValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#d9534f',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 40,
    width: '80%',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
