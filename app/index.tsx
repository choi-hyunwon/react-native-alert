import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  fetchBinancePrice,
  fetchUpbitPrice,
  getExchangeRate
} from '../src/api/cryptoAPI';

export default function HomeScreen() {
  const [upbitPrice, setUpbitPrice] = useState<number | null>(null);
  const [binancePrice, setBinancePrice] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [kimchiPremium, setKimchiPremium] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePremium = (krw: number, usd: number, rate: number) => {
    if (krw && usd && rate) {
      const premium = ((krw / (usd * rate)) - 1) * 100;
      setKimchiPremium(premium.toFixed(2)); // 소수점 2자리까지 표시
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 모든 데이터를 동시에 가져옵니다.
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
