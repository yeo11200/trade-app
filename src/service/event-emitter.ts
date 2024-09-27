// commonEmitter.js
import EventEmitter from 'eventemitter3';
import {Price} from '../type/coin';

// EventEmitter 인스턴스 생성
const commonEmitter = new EventEmitter();

export const COIN_EVENT_EMIT = 'coinPriceUpdated';

// 코인 가격 업데이트 함수
export const updateCoinPrice = (
  CoinSymbol: string,
  CoinMarket: string,
  newPrice: Price,
) => {
  // symbol과 함께 'coinPriceUpdated' 이벤트 발생
  commonEmitter.emit(`${COIN_EVENT_EMIT}-${CoinSymbol}-${CoinMarket}`, {
    newPrice,
  });
};

export default commonEmitter;
