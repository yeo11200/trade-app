import commonEmitter, {COIN_EVENT_EMIT} from '../service/event-emitter';
import {get} from '../service/fetch';
import {Coin, Price} from '../type/coin';

const initData: () => Promise<(Coin & Price)[]> = async () => {
  const res = await Promise.all([
    get<{data: Coin[]}>('/market/all'),
    get<{data: Price[]}>('/ticker/all?quoteCurrencies=KRW,BTC'),
  ]).then(res1 => {
    const resData: (Coin & Price)[] = [];

    const [{data: coin}, {data: price}] = res1 as unknown as [
      {data: Coin[]},
      {data: Price[]},
    ];

    const newPrice: Price[] = price ? [...price] : []; // Price 배열 복사

    if (!coin) {
      return [];
    }
    for (let i: number = 0; i < coin.length; i++) {
      const coinMarket: string = coin[i].market; // coin의 market 타입 정의

      for (let j: number = 0; j < newPrice.length; j++) {
        const priceMarket: string = newPrice[j].market; // newPrice의 market 타입 정의

        if (coinMarket === priceMarket) {
          resData.push({...coin[i], ...newPrice[j]}); // Daum과 Price를 병합
          newPrice.splice(j, 1); // 중복 제거
          break; // 매칭된 후에는 break로 나머지 반복 건너뜀
        }
      }
    }
    return resData;
  });

  return res as (Coin & Price)[];
};

const coinPrice = async () => {
  const {data} = await get<Price[]>('/ticker/all?quoteCurrencies=KRW,BTC');

  if (!data) {
    return;
  }

  for (let i = 0; i < data.length; i++) {
    const [CoinMarket, CoinSymbol] = data[i].market.split('-');
    commonEmitter.emit(
      `${COIN_EVENT_EMIT}-${CoinSymbol}-${CoinMarket}`,
      data[i],
    );
  }
};

const coinMarketAll = async () => {
  const {data} = await get<Coin[]>('/market/all');

  if (!data) {
    return;
  }
  const coins = data
    .filter((coin: Coin) => coin.market.startsWith('KRW')) // KRW 마켓에 해당하는 코인만 필터링
    .map((coin: Coin) => coin.market); // 예: ["KRW-BTC", "KRW-ETH", ...]

  return coins;
};

export const CoinInfo = {
  init: initData,
  coinMarketAll,
  coinPrice,
};
