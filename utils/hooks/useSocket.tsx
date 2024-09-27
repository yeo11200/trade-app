/* eslint-disable react-hooks/exhaustive-deps */
import {useRef, useEffect} from 'react';
import {CoinInfo} from '../../src/api-logic/coin-function';

interface WebSocketManager {
  sendMessage: (message: string) => void;
  closeConnection: () => void;
}

export const useWebSocket = (
  url: string,
  onMessageCallback?: (message: string) => void,
  maxRetries: number = 5, // 최대 재연결 시도 횟수 (기본값: 5회)
): WebSocketManager => {
  const ws = useRef<WebSocket | null>(null);
  const retryCount = useRef(0); // 재연결 시도 횟수를 저장
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null); // 재연결 타임아웃

  const connect = async () => {
    ws.current = new WebSocket(url);

    ws.current.onopen = async () => {
      console.log('WebSocket connected');
      retryCount.current = 0; // 연결 성공 시 재연결 횟수 초기화

      // 모든 코인 심볼 가져오기
      const allCoins = await CoinInfo.coinMarketAll(); // 모든 코인 심볼 가져옴

      // console.log(allCoins);
      // WebSocket 구독 요청 생성 (모든 코인 구독)
      const message = JSON.stringify([
        {ticket: 'test'},
        {type: 'ticker', codes: allCoins?.splice(0, 50)},
        // {type: 'orderbook', codes: allCoins},
      ]);

      console.log('구독 요청 메시지:', message); // 구독 요청 로깅
      ws.current?.send(message);
    };

    ws.current.onmessage = (event: any) => {
      try {
        // const data = JSON.parse(event.data);
        // console.log('수신한 메시지 데이터:', data); // 수신한 메시지 로깅
        if (onMessageCallback) {
          onMessageCallback(event.data);
        }
      } catch (error) {
        // console.error('메시지 파싱 오류:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      if (retryCount.current < maxRetries) {
        const reconnectDelay = Math.min(1000 * (retryCount.current + 1), 5000); // 1초에서 5초 사이 지연
        retryCount.current += 1;
        reconnectTimeout.current = setTimeout(() => {
          connect(); // 재연결 시도
        }, reconnectDelay);
      } else {
        console.log('Max retries reached. No longer attempting to reconnect.');
      }
    };

    ws.current.onerror = error => {
      console.error('WebSocket error:', (error as unknown as Error).message);
    };
  };

  useEffect(() => {
    connect(); // WebSocket 연결 초기화

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const closeConnection = () => {
    if (ws.current) {
      ws.current.close();
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
  };

  return {sendMessage, closeConnection};
};
