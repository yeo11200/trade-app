import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Text} from 'react-native-paper';
import HorizontalStack from '../HorizontalStack';
import VerticalStack from '../VerticalStack';
import {addCommas, convertToMillion, formatPercentage} from '../../../utils';
import {Animated, Dimensions, StyleSheet, View} from 'react-native';
import commonEmitter, {COIN_EVENT_EMIT} from '../../service/event-emitter';
import {Price} from '../../type/coin';

export interface CoinDetailProps {
  marketName: string;
  coinName: string;
  symbol?: string;
  price: number;
  changeRate: number;
  changePrice: number;
  accTradePrice: number;
}

const {width} = Dimensions.get('window'); // 화면의 너비를 가져옴

const CoinDetail = ({
  marketName,
  coinName,
  symbol,
  price,
  changeRate,
  changePrice,
  accTradePrice,
}: CoinDetailProps) => {
  const [, setHighlighted] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const [data, setData] = useState<{
    price: number;
    changePrice: number;
    changeRate: number;
    accTradePrice: number;
  }>({
    price: price,
    changePrice: changePrice,
    changeRate: changeRate,
    accTradePrice: accTradePrice,
  });

  // borderColor와 borderWidth 애니메이션 설정
  const interpolatedBorderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', data.changeRate >= 0 ? 'red' : 'blue'], // 가격 상승 시 녹색, 하락 시 빨간색
  });

  const interpolatedBorderWidth = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], // borderWidth가 0에서 2로 변동
  });

  // 동적으로 텍스트 색상을 결정
  const changeRateStyle = useMemo(() => {
    return {
      color: data.changeRate >= 0 ? 'red' : 'blue', // 양수면 녹색, 음수면 빨간색
    };
  }, [data.changeRate]);

  // 하이라이트 효과를 부여하는 함수
  const triggerHighlight = useCallback(() => {
    setHighlighted(true);
    Animated.timing(borderColorAnim, {
      toValue: 1, // 강조 색상으로 변화
      duration: 100, // 0.3초 동안 애니메이션
      useNativeDriver: false, // backgroundColor 애니메이션은 Native Driver 사용 불가
    }).start(() => {
      // 애니메이션이 끝나면 원래 색상으로 복귀
      Animated.timing(borderColorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setHighlighted(false);
      });
    });
  }, [borderColorAnim]);

  const priceData = useCallback(
    (dataRE: Price) => {
      if (dataRE.trade_price !== data.price) {
        setData(prev => {
          return {
            ...prev,
            price: dataRE.trade_price,
            changePrice: dataRE.signed_change_price,
            changeRate: dataRE.signed_change_rate,
            accTradePrice: dataRE.acc_trade_price_24h,
          };
        });
        triggerHighlight();
      }
    },
    [data.price, triggerHighlight],
  );

  useEffect(() => {
    commonEmitter.on(`${COIN_EVENT_EMIT}-${symbol}-${marketName}`, priceData);

    return () => {
      commonEmitter.off(
        `${COIN_EVENT_EMIT}-${symbol}-${marketName}`,
        priceData,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HorizontalStack spacing={15} style={styles.container}>
      <VerticalStack spacing={0} style={styles.coinNameContainer}>
        <Text style={styles.coinName} numberOfLines={2} ellipsizeMode="tail">
          {coinName}
        </Text>
        <Text style={styles.marketName}>{`${symbol}/${marketName}`}</Text>
      </VerticalStack>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{addCommas(data.price)}</Text>
      </View>
      <Animated.View
        style={[
          {
            borderColor: interpolatedBorderColor,
            borderWidth: interpolatedBorderWidth,
          },
        ]}>
        <VerticalStack spacing={0} style={styles.changeContainer}>
          <Text style={styles.changePrice}>{addCommas(data.changePrice)}</Text>
          <Text style={[styles.changeRate, changeRateStyle]}>
            {formatPercentage(data.changeRate * 100)}
          </Text>
        </VerticalStack>
      </Animated.View>
      <HorizontalStack spacing={0} style={styles.tradeContainer}>
        <Text style={styles.tradePrice}>
          {addCommas(convertToMillion(data.accTradePrice))}
        </Text>
        <Text>백만</Text>
      </HorizontalStack>
    </HorizontalStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    width: width, // 화면 양쪽에 여백을 두고 전체 너비 설정
  },
  coinNameContainer: {
    flex: 2, // 코인 이름 영역에 더 많은 공간 할당
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 70,
  },
  coinName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  marketName: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left',
  },
  priceContainer: {
    flex: 1, // 가격 영역에 일정한 공간 할당
    justifyContent: 'center',
    alignItems: 'flex-end', // 가운데 정렬로 통일
    width: 100, // 고정된 너비 설정
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // 가격을 가운데 정렬
  },
  changeContainer: {
    flex: 1, // 변동 가격 및 변동률 영역에 일정한 공간 할당
    justifyContent: 'flex-start',
    alignItems: 'flex-start', // 가운데 정렬로 통일
    width: 80, // 고정된 너비 설정
  },
  changePrice: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center', // 가운데 정렬
  },
  changeRate: {
    fontSize: 14,
    textAlign: 'center', // 가운데 정렬
  },
  tradeContainer: {
    flex: 1.5, // 거래량 영역에 더 많은 공간 할당
    justifyContent: 'flex-start', // 컨테이너 자체 가운데 정렬
    alignItems: 'center', // 수평 및 수직 가운데 정렬
    width: 100, // 고정된 너비 설정
  },
  tradePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center', // 텍스트 가운데 정렬
  },
});

export default CoinDetail;
