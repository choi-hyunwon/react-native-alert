const UPBIT_API_URL = 'https://api.upbit.com/v1/ticker?markets=KRW-BTC';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT';

/**
 * 업비트에서 현재 비트코인 KRW 가격을 가져옵니다.
 * @returns {Promise<number>} 현재 비트코인 원화 가격
 */
export const fetchUpbitPrice = async (): Promise<number> => {
  try {
    const response = await fetch(UPBIT_API_URL);
    const json = await response.json();
    return json[0].trade_price;
  } catch (error) {
    console.error("Error fetching Upbit price:", error);
    throw error;
  }
};

/**
 * 바이낸스에서 현재 비트코인 USDT 가격을 가져옵니다.
 * @returns {Promise<number>} 현재 비트코인 달러 가격
 */
export const fetchBinancePrice = async (): Promise<number> => {
  try {
    const response = await fetch(BINANCE_API_URL);
    const json = await response.json();
    return parseFloat(json.price);
  } catch (error) {
    console.error("Error fetching Binance price:", error);
    throw error;
  }
};

/**
 * 현재 USD/KRW 환율을 가져옵니다.
 * @returns {Promise<number>} 현재 달러-원 환율
 */
export const getExchangeRate = async (): Promise<number> => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data.result === 'success' && data.rates && data.rates.KRW) {
      return data.rates.KRW;
    } else {
      throw new Error('Invalid data structure from exchange rate API');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};