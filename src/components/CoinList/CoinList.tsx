import React, {useCallback, useEffect, useState} from 'react';
import CoinDetail from './CoinDetail';
import {ScrollView} from 'react-native';
import {Coin, Price} from '../../type/coin';
import {CoinInfo} from '../../api-logic/coin-function';
import VerticalStack from '../VerticalStack';

const CoinList = () => {
  const [coinOriginalList, setCoinOriginalList] = useState<(Coin & Price)[]>(
    [],
  );
  const [marketName] = useState<string>('KRW');
  const [list, setList] = useState<(Coin & Price & {symbol: string})[]>([]);

  const b = useCallback(async () => {
    const coinList = (await CoinInfo?.init()) || [];
    setCoinOriginalList(coinList);
    // console.log(a);
    // setCoinOriginalList(a?.data || []);
  }, []);

  useEffect(() => {
    b();
    // const coinPriceInterval = setInterval(() => CoinInfo.coinPrice(), 1000);

    return () => {
      // clearInterval(coinPriceInterval);
    };
  }, [b]);

  useEffect(() => {
    if (coinOriginalList.length) {
      const a = coinOriginalList
        .filter(res => res.market.includes(marketName))
        .map(res => {
          return {...res, symbol: res.market.split(`${marketName}-`)[1]};
        });
      setList(a);
    }
  }, [coinOriginalList, marketName]);

  return (
    <ScrollView>
      <VerticalStack spacing={10}>
        {list.map(res => {
          return (
            <CoinDetail
              key={res.korean_name + res.market}
              marketName={marketName}
              coinName={res.korean_name}
              symbol={res.symbol}
              price={res.trade_price}
              changeRate={res.signed_change_rate}
              changePrice={res.signed_change_price}
              accTradePrice={res.acc_trade_price_24h}
            />
          );
        })}
      </VerticalStack>
    </ScrollView>
  );
};
export default CoinList;
