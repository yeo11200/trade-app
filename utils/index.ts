export const convertToMillion = (price: number) => {
  const million = 1000000;
  const result = Math.floor(price / million); // 백만 단위로 변환하고 소수점 아래 자르기
  return result;
};
export const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

/**
 * 3자리마다 콤마추가
 * @param number number | string
 */
export const addCommas = (number: number | string) => {
  // 숫자를 문자열로 변환
  const strNumber = String(number);

  // 정규식을 사용하여 3자리마다 콤마 추가
  return strNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
