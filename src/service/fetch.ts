// api.ts

const BASE_URL = 'https://api.upbit.com/v1';

// 요청 메소드 타입 정의
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 전역적으로 사용할 토큰 변수
let authToken: string | null = null;

// 토큰 설정 함수 (로그인 시 호출)
export const setAuthToken = (token: string) => {
  authToken = token;
};

// 공통 요청 함수의 타입 정의
interface RequestConfig<T> {
  endpoint: string;
  method?: HttpMethod;
  data?: T;
  timeout?: number;
}

// 응답 타입 정의
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// 공통 fetch 함수
const request = async <T, R>({
  endpoint,
  method = 'GET',
  data,
  timeout = 5000,
}: RequestConfig<T>): Promise<ApiResponse<R>> => {
  const url = `${BASE_URL}${endpoint}`;

  // 헤더 타입을 Record<string, string>으로 지정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // 타임아웃 처리를 위한 Promise
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request Timeout')), timeout),
  );

  // fetch 요청 옵션
  const options: RequestInit = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data); // POST, PUT 요청 시 body 데이터 추가
  }

  try {
    const fetchPromise = fetch(url, options);
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error ${response.status}: ${
          errorData.message || 'Something went wrong'
        }`,
      );
    }

    const responseData = (await response.json()) as R;
    return {data: responseData};
  } catch (error: any) {
    return {error: error.message || 'Request failed'};
  }
};

// GET 요청 함수
export const get = async <R>(endpoint: string): Promise<ApiResponse<R>> => {
  return request<null, R>({endpoint});
};

// POST 요청 함수
export const post = async <T, R>(
  endpoint: string,
  data: T,
): Promise<ApiResponse<R>> => {
  return request<T, R>({endpoint, method: 'POST', data});
};

// PUT 요청 함수
export const put = async <T, R>(
  endpoint: string,
  data: T,
): Promise<ApiResponse<R>> => {
  return request<T, R>({endpoint, method: 'PUT', data});
};

// DELETE 요청 함수
export const remove = async <R>(endpoint: string): Promise<ApiResponse<R>> => {
  return request<null, R>({endpoint, method: 'DELETE'});
};
