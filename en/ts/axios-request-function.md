---
title: 'An asynchronous request method based on Axios'
keywords: 'Axios, request, typescript'
description: 'This article shares a request function encapsulated based on Axios to reduce redundant code and standardize asynchronous request error handling.'
changefreq: 'yearly'
---

## 1 Background

In the field of web front-end development, there are many ways to make asynchronous requests: XHR, Fetch, Axios, SWR…

Mixing different methods can make a project messy. Moreover, in the same project, API-related configurations are often the same, such as Domain, Timeout, Base URL, Authorization, and error handling…

To unify the behavior of asynchronous requests, "bridge the gap" between different methods, and reduce redundant code, we **should** encapsulate a **universal** request handler on top of them.

## 2 Encapsulation

Below is a complete asynchronous request encapsulation based on Axios and TypeScript 👇🏻, ready to be copied and used directly:

```ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { message as msg } from 'ant-design-vue';

export interface IResponseData<T> {
  data: T;
  code: number;
  success: boolean;
  message?: string;
}

export const getApiPrefix = () => import.meta.env.VITE_APP_API_PREFIX;

/**
 * Interface response type;
 * Returns `T` when the request is successful;
 * Returns `undefined` when the request fails.
 */
export type ResponseType<T> = Promise<T | undefined>;

/**
 * A Http request class encapsulated based on Axios. In addition to Axios features, it has the following characteristics:
 * @Feature1 Handles authorization in the request interceptor;
 * @Feature2 "Hierarchically processes" various exceptions in the response interceptor;
 * @Feature3 The API no longer returns AxiosResponse but AxiosResponse.data.data,
 *           with an added "escape hatch" to return AxiosResponse if needed, i.e., request.request({ ..., withAxiosResponse: true });
 * @Feature4 Provides a built-in method to cancel requests: request.createAbortController.
 */
export class HttpRequest {
  readonly instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);

    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // If your project uses the Storage API to store authorization tokens, you can add related logic here.
        return config;
      },

      (error: AxiosError) => {
        msg.error(`${error}(${error.status})`);
        console.error(error);
      },
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (
        response: AxiosResponse & { config: { withAxiosResponse?: boolean } },
      ) => {
        // Non-JSON type, return directly
        if (
          !response.headers['content-type']
            ?.toString()
            .includes('application/json')
        ) {
          if (!response.config.withAxiosResponse) {
            return response.data;
          } else {
            return response;
          }
        }

        const {
          success,
          code: svrCode,
          message: svrMsg,
        } = response.data as IResponseData<unknown>;

        if (!success) {
          // First layer: Custom error messages and error codes under normal HTTP Status
          msg.error(`${svrMsg}(${svrCode})`);
        } else if (svrMsg) {
          // Success message, such as "Login successful"
          msg.info(svrMsg);
        }

        // In actual use, most cases won't need the response, so by default, only response.data is returned.
        // Since the backend defines the data structure of ResponseData: IResponseData 👆🏻,
        // it is enough to return response.data.data.
        if (!response.config.withAxiosResponse) {
          return response.data.data;
        } else {
          return response;
        }
      },

      (error: AxiosError) => {
        let message = '';

        // Second layer: Custom error messages and error codes under exceptional HTTP Status
        if (error.response?.data) {
          const {
            code: svrCode,
            message: svrMsg,
            success,
          } = error.response.data as IResponseData<unknown>;
          if (success === false) {
            message = `${svrMsg}(${svrCode})`;
          } else {
            // When there's an error, success must be false. If it's true, it's a BUG.
            message =
              "You've found a BUG, please contact the administrator as soon as possible! (BUG)";
          }
        }
        // Third layer: HTTP Status & Status Text
        else if (error.response) {
          switch (error.response.status) {
            case 400:
              message = 'Bad Request (400)'
              break
            case 401:
              message = 'Unauthorized, please log in again (401)'
              // You can trigger re-login logic here
              break
            case 403:
              message = 'Forbidden (403)'
              break
            case 404:
              message = 'Requested resource not found (404)'
              break
            case 405:
              message = 'Method Not Allowed (405)'
              break
            case 408:
              message = 'Request Timeout (408)'
              break
            case 500:
              message = 'Internal Server Error (500)'
              break
            case 501:
              message = 'Not Implemented (501)'
              break
            case 502:
              message = 'Bad Gateway (502)'
              break
            case 503:
              message = 'Service Unavailable (503)'
              break
            case 504:
              message = 'Gateway Timeout (504)'
              break
            case 505:
              message = 'HTTP Version Not Supported (505)'
              break
            default:
              message = `${error.response.statusText} (${error.response.status})`
          }
        }
        // Fourth layer: No response from the request
        else if (error.message || error.code) {
          message = `${error.message}(${error.code})`;
        }
        // Fifth layer: Unknown exception
        else {
          message = `${error}(???)`;
        }

        msg.error(message);
        console.error(error);

        // return undefined
      },
    );
  }

  /**
   * Creates a cancellation controller;
   * Used to cancel requests in certain situations.
   */
  createAbortController() {
    return new AbortController();
  }

  getUri(...params: Parameters<AxiosInstance['getUri']>): string {
    return this.instance.getUri.call(this, ...params) as string;
  }

  request<T = unknown, R = AxiosResponse<T>, D = unknown>(
    config: AxiosRequestConfig<D> & { withAxiosResponse?: boolean },
  ): Promise<R> {
    return this.instance.request.call(this, config) as Promise<R>;
  }

  get<T>(...params: Parameters<AxiosInstance['get']>): ResponseType<T> {
    return this.instance.get.call(this, ...params) as ResponseType<T>;
  }

  post<T>(...params: Parameters<AxiosInstance['post']>): ResponseType<T> {
    return this.instance.post.call(this, ...params) as ResponseType<T>;
  }

  put<T>(...params: Parameters<AxiosInstance['put']>): ResponseType<T> {
    return this.instance.put.call(this, ...params) as ResponseType<T>;
  }

  patch<T>(...params: Parameters<AxiosInstance['patch']>): ResponseType<T> {
    return this.instance.patch.call(this, ...params) as ResponseType<T>;
  }

  delete<T>(...params: Parameters<AxiosInstance['delete']>): ResponseType<T> {
    return this.instance.delete.call(this, ...params) as ResponseType<T>;
  }

  postForm<T>(
    ...params: Parameters<AxiosInstance['postForm']>
  ): ResponseType<T> {
    return this.instance.postForm.call(this, ...params) as ResponseType<T>;
  }

  putForm<T>(...params: Parameters<AxiosInstance['putForm']>): ResponseType<T> {
    return this.instance.putForm.call(this, ...params) as ResponseType<T>;
  }

  patchForm<T>(
    ...params: Parameters<AxiosInstance['patchForm']>
  ): ResponseType<T> {
    return this.instance.patchForm.call(this, ...params) as ResponseType<T>;
  }
}

export const request = new HttpRequest({
  baseURL: getApiPrefix(),
  timeout: 30 * 1000,
});
```

## 3 Features

### 3.1 No try ... catch ...

No annoying `try ... catch ...` exception handling. You just need to check if the return value is `undefined` to know if an exception occurred (because `undefined` is not a JSON type and won’t be returned from the backend). For example:

```ts
const todoList = await todoApi.query();
setList(todoList || []);
```

Instead, exceptions are handled uniformly in `interceptors.response`.

### 3.2 Exception Layering

In `interceptors.response`, exceptions are handled in a "layered" manner, with priority from high to low: `error.response.data.success === false` > `error.response.status` > `error.code` > `error`.

"Exception layering" helps developers quickly locate issues and improves the effectiveness of testing.

### 3.3 Response Value Destructuring

In daily development, developers usually don’t need to use the `headers`, `status`, etc., of an asynchronous request. Therefore, in `interceptors.response`, by default, only `response.data` is returned.

Since the backend returns a JSON structure wrapped by `IResponseData<T>`, the default is to return `response.data.data`.

### 3.4 Response "Escape Hatch"

Although most of the time, `headers`, `status`, etc., are not needed, there may be rare cases where they are. Therefore, an 'escape hatch' is provided to access this information. This can be done using `request.request({ ..., withAxiosResponse: true })`:

```ts
const res = await request.request({ /* ... */, withAxiosResponse: true });
if (res.headers['content-type'] === 'application/octet-stream') {
  // ...
}
```

### 3.5 Cancel Requests

Using `request.createAbortController()` generates a controller used to cancel requests. It can be used across multiple interfaces to cancel requests, which is helpful in **performance-critical scenarios**:

```ts
const controller = request.createAbortController();
request.get('/userInfo', { signal: controller.signal });

setTimeout(() => {
  controller.abort();
});
```

It is important to note: canceled requests will still be executed on the backend; “cancelling” is only a client-side action.

### 3.6 TypeScript Type Friendly

When using Axios in TypeScript, you often specify types like this:

```ts
const res: AxiosResponse<IUserInfo> = await axios.get<IUserInfo>('xxx');
// res.data.nickname
```

After encapsulation, **the response is the Data**, which makes the code more concise:

```ts
const userInfo = await axios.get<IUserInfo>('xxx');
// userInfo.nickname
```

## 4 Github Repository

GitHub Link: [axios-request-ts](https://github.com/reasonly7/axios-request-ts)
