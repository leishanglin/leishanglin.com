---
title: 'request.ts: 一个基于 Axios 封装的异步请求函数'
keywords: 'Axios, request, typescript'
description: '本文分享了一个基于 Axios 封装的 request 函数，用于减少重复代码的书写，规范异步请求错误处理'
changefreq: 'yearly'
---

## 1 背景

在 Web 前端领域，有很多方法进行异步请求：xhr、fetch、axios、swr ...

不同方法混用，会把项目搞得一团乱，并且，同一个项目中，跟 API 有关的配置往往是相同的，比如：Domain、Timeout、Base URL、Authorization、异常处理 ...。

为了统一异步请求的行为、“抹平”不同方式之间的差异、减少重复代码的书写，我们**理应**在它们之上，封装一层**通用**的请求处理。

## 2 封装

以下是完整的、基于 Axios + TypeScript 的异步请求封装👇🏻，可以直接复制使用：

```ts
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { message as msg } from 'ant-design-vue'

export interface IResponseData<T> {
  data: T
  code: number
  success: boolean
  message?: string
}

export const getApiPrefix = () => import.meta.env.VITE_APP_API_PREFIX

/**
 * 接口响应值类型;
 * 当接口请求正常时，返回 T;
 * 当接口请求异常时，返回 undefined;
 */
export type ResponseType<T> = Promise<T | undefined>

/**
 * 基于 Axios 封装的 Http 请求类，在 Axios 的基础上，它还具有以下特性:
 * @特性1 在请求拦截器中处理授权;
 * @特性2 在响应拦截器中"分层处理"各种异常;
 * @特性3 接口不再返回 AxiosResponse, 而是返回 AxiosResponse.data.data,
 * 同时添加了一个"逃生舱"，用于返回 AxiosResponse，即:request.request({ ..., withAxiosResponse: true });
 * @特性4 内置了取消请求的方法:request.createAbortController;
 */
export class HttpRequest {
  /**
   * 这是 Axios 实例;
   * 在想要获取 AxiosResponse 时使用，比如:
   * 它会返回 AxiosResponse 包裹的 ResponseType
   */
  readonly instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)

    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        // 这里添加授权相关的信息
        return config
      },

      (error: AxiosError) => {
        msg.error(`${error}(${error.status})`)
        console.error(error)
      },
    )

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse & { config: { withAxiosResponse?: boolean } }) => {
        // 非JSON类型，直接返回
        if (!response.headers['content-type']?.toString().includes('application/json')) {
          if (!response.config.withAxiosResponse) {
            return response.data
          } else {
            return response
          }
        }

        const { success, code: svrCode, message: svrMsg } = response.data as IResponseData<unknown>

        if (!success) {
          // 第一层: 自定义错误提示及错误码
          msg.error(`${svrMsg}(${svrCode})`)
        } else if (svrMsg) {
          // 操作成功的提示，比如“登录成功”
          msg.info(svrMsg)
        }

        // 实际使用时，大多数情况都不会用到 response, 所以默认只返回 response.data
        // 又因为后端规范了 ResponseData 的数据结构: IResponseData 👆🏻, 所以只需要返回 response.data.data 即可
        if (!response.config.withAxiosResponse) {
          return response.data.data
        } else {
          return response
        }
      },

      (error: AxiosError) => {
        let message = ''

        // 第二层: 异常 HTTP Status 下的自定义错误提示及错误码
        if (error.response?.data) {
          const {
            code: svrCode,
            message: svrMsg,
            success,
          } = error.response.data as IResponseData<unknown>
          if (success === false) {
            message = `${svrMsg}(${svrCode})`
          } else {
            // Error 时，success 必为 false，若为 true，则为 BUG
            message = '你找到了一个 BUG，请尽快联系管理员!(BUG)'
          }
        }
        // 第三层: HTTP Status & Status Text
        else if (error.response) {
          switch (error.response.status) {
            case 400:
              message = '请求错误(400)'
              break
            case 401:
              message = '未授权，请重新登录(401)'
              // 可以在这里触发重新登录逻辑
              break
            case 403:
              message = '拒绝访问(403)'
              break
            case 404:
              message = '请求的资源不存在(404)'
              break
            case 405:
              message = '请求方法不允许(405)'
              break
            case 408:
              message = '请求超时(408)'
              break
            case 500:
              message = '服务器内部错误(500)'
              break
            case 501:
              message = '服务未实现(501)'
              break
            case 502:
              message = '网关错误(502)'
              break
            case 503:
              message = '服务不可用(503)'
              break
            case 504:
              message = '网关超时(504)'
              break
            case 505:
              message = 'HTTP 版本不受支持(505)'
              break
            default:
              message = `${error.response.statusText}(${error.response.status})`
          }
        }
        // 第四层: 请求无响应
        else if (error.message || error.code) {
          message = `${error.message}(${error.code})`
        }
        // 第五层: 未知异常
        else {
          message = `${error}(???)`
        }

        msg.error(message)
        console.error(error)

        // return undefined
      },
    )
  }

  /**
   * 创建一个取消控制器;
   * 用于在某些情况下取消请求;
   */
  createAbortController() {
    return new AbortController()
  }

  getUri(...params: Parameters<AxiosInstance['getUri']>): string {
    return this.instance.getUri.call(this, ...params) as string
  }

  request<T = unknown, R = AxiosResponse<T>, D = unknown>(
    config: AxiosRequestConfig<D> & { withAxiosResponse?: boolean },
  ): Promise<R> {
    return this.instance.request.call(this, config) as Promise<R>
  }

  get<T>(...params: Parameters<AxiosInstance['get']>): ResponseType<T> {
    return this.instance.get.call(this, ...params) as ResponseType<T>
  }

  post<T>(...params: Parameters<AxiosInstance['post']>): ResponseType<T> {
    return this.instance.post.call(this, ...params) as ResponseType<T>
  }

  put<T>(...params: Parameters<AxiosInstance['put']>): ResponseType<T> {
    return this.instance.put.call(this, ...params) as ResponseType<T>
  }

  patch<T>(...params: Parameters<AxiosInstance['patch']>): ResponseType<T> {
    return this.instance.patch.call(this, ...params) as ResponseType<T>
  }

  delete<T>(...params: Parameters<AxiosInstance['delete']>): ResponseType<T> {
    return this.instance.delete.call(this, ...params) as ResponseType<T>
  }

  postForm<T>(...params: Parameters<AxiosInstance['postForm']>): ResponseType<T> {
    return this.instance.postForm.call(this, ...params) as ResponseType<T>
  }

  putForm<T>(...params: Parameters<AxiosInstance['putForm']>): ResponseType<T> {
    return this.instance.putForm.call(this, ...params) as ResponseType<T>
  }

  patchForm<T>(...params: Parameters<AxiosInstance['patchForm']>): ResponseType<T> {
    return this.instance.patchForm.call(this, ...params) as ResponseType<T>
  }
}

export const request = new HttpRequest({
  baseURL: getApiPrefix(),
  timeout: 30 * 1000,
})
```

## 3 特性

### 3.1 无 try ... catch ...

没有恶心的 `try ... catch ...` 异常处理, 只需要判断返回值是否为 `undefined`，就能知道是否发生异常（因为 undefined 不是 JSON 类型，不会从后端返回 undefined），比如：

```ts
const todoList = await todoApi.query()
setList(todoList || [])
```

取而代之的，是在 interceptors.response 中统一处理异常。

### 3.2 异常分层

在 interceptors.response 中，异常的处理是“分层”的，优先级从高到底分别是：`error.response.data.success === false` > `error.response.status` > `error.code` > `error`。

“异常分层”可以让开发者快速定位问题，也更利于测试的有效性。

### 3.3 响应值解构

在日常开发者，大多数情况下都不会用到异步请求的 header、status 等，所以在 interceptors.response 中，默认只返回 response.data。

又因为后端返回的 JSON 结构是经过 `IResponseData<T>` 统一包装过的，所以默认返回 response.data.data。


### 3.4 响应”逃生舱“

尽管大多数情况都不需要 header、status 等，但极个别的情况还是会用到，所以还是需要预留一个“口子”，用于获取这些信息，做法是使用 `request.request({..., withAxiosResponse: true})`：

```ts
const res = await request.request({ /* ... */, withAxiosResponse: true});
if (res.headers['content-type'] === 'application/octet-stream') {
	// ...
}
```

### 3.5 取消请求

使用 `request.createAbortController()` 可以生成一个用于取消请求的 controller，它可以被多个接口使用，用于取消请求，这在一些性能至上的场景下会用上：

```ts
const controller = request.createAbortController()
request.get('/userInfo', { signal: controller.signal })

setTimeout(() => {
	controller.abort()
})
```

值得注意的是：取消的请求仍旧会在后端执行，“取消”只是一种客户端行为。

### 3.6 TS 类型友好

在 TS 中使用 Axios 时，往往会这样标注类型：

```ts
const res: AxiosResponse<IUserInfo> = await axios.get<IUserInfo>('xxx')
// res.data.nickname
```

经过封装后，**响应即 Data**，会更加简洁：

```ts
const userInfo = await axios.get<IUserInfo>('xxx')
// userInfo.nickname
```

## 4 Github 仓库

Github 链接：[axios-request-ts](https://github.com/reasonly7/axios-request-ts)