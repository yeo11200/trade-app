/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';

import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CoinList from './src/components/CoinList';
import {useWebSocket} from './utils/hooks/useSocket';

interface TickerData {
  trade_price: number; // 실시간 거래 가격
}

interface OrderbookData {
  ask_price: number; // 매도 호가
  bid_price: number; // 매수 호가
}

function App(): React.JSX.Element {
  const Stack = createNativeStackNavigator();

  const [priceData, setPriceData] = useState<TickerData | null>(null);
  const [orderbookData, setOrderbookData] = useState<OrderbookData[] | null>(
    null,
  );

  // WebSocket에서 받은 메시지를 처리하는 함수
  const handleWebSocketMessage = (message: string) => {
    console.log(message);
    // const parsedData = JSON.parse(message);
    // if (parsedData.type === 'ticker') {
    //   setPriceData(parsedData);
    // } else if (parsedData.type === 'orderbook') {
    //   setOrderbookData(parsedData.orderbook_units);
    // }
  };

  // WebSocket 연결 설정 (props로 전달받은 symbol과 types를 사용)
  // const {closeConnection} = useWebSocket(
  //   'wss://api.upbit.com/websocket/v1', // Upbit WebSocket API URL
  //   handleWebSocketMessage,
  // );

  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    // WebSocket 연결 설정
    ws.current = new WebSocket('wss://api.upbit.com/websocket/v1');

    // WebSocket 연결 성공 시
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      console.log('WebSocket connected');

      const message = `${JSON.stringify([
        {ticket: 'test'},
        {type: 'ticker', codes: ['KRW-BTC']},
      ])}`;

      console.log(message);
      try {
        console.log('구독 요청 메시지 전송됨:', message);
        ws.current?.send(message);
      } catch (error) {
        console.error('구독 요청 메시지 전송 중 오류 발생:', error);
      }
    };
    // WebSocket에서 메시지 수신 시
    ws.current.onmessage = event => {
      console.log('Received message:', event);
    };

    // WebSocket 연결 종료 시
    ws.current.onclose = event => {
      console.log('WebSocket closed:', event.code, event.reason);
    };

    // WebSocket 에러 처리
    ws.current.onerror = event => {
      console.error('WebSocket error:', event);
    };

    // 컴포넌트 언마운트 시 WebSocket 종료
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={[styles.container, {backgroundColor: 'black'}]}>
          {/* <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          /> */}
          <Stack.Navigator initialRouteName="Home">
            {/* 메인 화면 (홈 화면) */}
            <Stack.Screen name="Home" component={CoinList} />

            {/* 상세 정보 화면 */}
            {/* <Stack.Screen name="Details" component={DetailScreen} /> */}
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start', // 맨 위부터 배치
    alignItems: 'stretch', // 가로로 꽉 차게 확장
  },
});

export default App;
