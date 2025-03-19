---
title: 'JavaScript: Bytes Unit Conversion — Byte to KB, MB, GB, TB …'
keywords: 'JavaScript, bytes unit conversion, Bytes, KB, MB, GB, TB'
description: 'This is an article exploring JavaScript implementations of byte unit conversion, covering multiple approaches.'
changefreq: 'monthly'
---

## Background

Converting bytes to KB, MB, GB, TB, etc., is a common requirement, and there are various ways to implement it. This article lists four common methods, with the fourth method, [the BigInt version](#method-4-bigint-recommended), being the most recommended.

## Method 1: if else

The common approach is to check whether `bytes / 1024` is greater than `1024`, and based on that, decide whether to increase the unit:

```ts
function formatBytes(bytes: number) {
  const K = 1024;

  if (bytes < K) {
    return `${bytes} B`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} KB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} MB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} MB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} GB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} TB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} PB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} EB`;
  } else if ((bytes /= K) < K) {
    return `${bytes.toFixed(2)} ZB`;
  } else {
    return `${bytes.toFixed(2)} YB`;
  }
}

formatBytes(1024 * 1024); // "1.00 MB"
```

`(bytes /= K) < K` is a shorthand, equivalent to:

```ts
bytes = bytes / K;
if (bytes < K) {
  // ...
}
```

## Method 2：while

Using if-else can be a bit cumbersome, so let’s rewrite it using a while loop.

```ts
function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const K = 1024;
  let i = 0;

  while (bytes >= 1024 && i < sizes.length - 1) {
    bytes /= K;
    i++;
  }

  return `${bytes.toFixed(2)} ${sizes[i]}`;
}

formatBytes(1024 * 1024); // "1.00 MB"
```

## Method 3：Math.log

Compared to if-else, using a while loop feels much cleaner, but there’s an even better approach: Math.log.

```ts
function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const K = 1024;

  const i = Math.floor(Math.log(bytes) / Math.log(K));
  bytes /= Math.pow(K, i);

  return `${bytes.toFixed(2)} ${sizes[i]}`;
}

formatBytes(1024 * 1024); // "1.00 MB"
```

Compared to `while`, Math.log completes the operation in constant time (O(logn)), directly calculating the index i through logarithmic computation, making it feel more “advanced.”

Logarithmic operations are the “inverse” of exponential operations. What we want to get is essentially the logarithm of `bytes` with base `K`, and then take the floor to get the index corresponding to the `sizes` array.

Since JavaScript doesn’t provide a built-in method for calculating logarithms with arbitrary bases, we use the logarithmic “change of base formula”:

![Change of Base Formula for Logarithms](/en/ts/assets/log-a-b.png)

Math.log is JavaScript’s built-in method for calculating natural logarithms, and by using `Math.log(bytes) / Math.log(K)`, we can obtain the index (subscript) of the target unit.

## Limit the effective range

So far, our formatBytes function hasn’t imposed any restrictions on the parameters. While TypeScript constraints are in place, they are only effective during development and cannot verify whether the parameter is a non-negative integer. Therefore, the following code is added:

```ts
function formatBytes(bytes: number) {
  // Throw an exception when bytes is not a non-negative integer, or when bytes is greater than 2 ** 53 - 1.
  if (
    !(Number.isInteger(bytes) && bytes >= 0 && bytes <= Number.MAX_SAFE_INTEGER)
  ) {
    throw new Error(
      "Invalid input: `bytes` must be a non-negative integer within Number.MAX_SAFE_INTEGER",
    );
  }

  // ...
}

formatBytes(Number.MAX_SAFE_INTEGER); // "8.00 PB"
formatBytes(Number.MAX_SAFE_INTEGER + 1); //  Error
```

`Number.MAX_SAFE_INTEGER` is a constant equal to `2^53 - 1`, which is the largest integer that JavaScript can safely represent and calculate accurately. There is also `Number.MIN_SAFE_INTEGER`, which represents the smallest integer that JavaScript can safely calculate accurately.

```ts
Number.MAX_SAFE_INTEGER === Math.pow(2, 53) - 1; // true
Number.MIN_SAFE_INTEGER === -(2 ** 53 - 1); // true
```

## Method 4: BigInt (Recommended)

If you’re careful enough, you’ll notice that the maximum value our formatBytes can handle is around 8.00 PB, which is `Number.MAX_SAFE_INTEGER` bytes. Any value larger than that will lose precision:

```ts
2 ** 53 - 1; // Normal 9007199254740991
2 ** 53; // Normal 9007199254740992
2 ** 53 + 1; // Abnormal：9007199254740992
2 ** 53 + 2; // Abnormal：9007199254740994
```

This issue is not common, as 8.00 PB is already a very large number and sufficient for everyday use. However, if you need to support even larger values, you can use the new primitive data type introduced in ES2020: [BigInt](https://github.com/tc39/proposal-bigint). Below is the rewritten code:

```ts
function formatBytes(bytes: string | bigint | number) {
  try {
    bytes = BigInt(bytes);
    if (bytes < 0n) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "Invalid input: `bytes` must be an integer, BigInt, or an integer string, and they all must be non-negative",
    );
  }

  if (bytes === 0n) {
    return "0 B";
  }

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]; // and more ...
  const K = 1024n;
  let i = 0n;
  const originBytes = bytes;
  while (bytes >= K && i < sizes.length - 1) {
    bytes /= K;
    i++;
  }

  const intPart = bytes;
  const level = K ** i;
  const decimalPart = originBytes - level * intPart;
  const num = Number(intPart) + Number((decimalPart * 1000n) / level) / 1000;

  if (num > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      `Invalid input: \`bytes\` exceeds the maximum precise value that ${
        sizes[sizes.length - 1]
      } can represent`,
    );
  }

  return `${num.toFixed(2)} ${sizes[Number(i)]}`;
}

// formatBytes(1024n ** 8n * BigInt(Number.MAX_SAFE_INTEGER)); // 9007199254740991.00 YB
// formatBytes(1024n ** 8n * BigInt(Number.MAX_SAFE_INTEGER + 1)); // Error
```

Note:

-	`Math.log()` does not support passing a BigInt, so the while loop approach is used.

- Since division with BigInt automatically truncates (not rounds) the decimal part, the code handles the decimal portion separately.

- When bytes becomes so large that even the YB scale exceeds `Number.MAX_SAFE_INTEGER`, an error will be triggered. If you don’t want the error, you can add higher units to the sizes array beyond YB.

This approach is ideal because it is not affected by floating-point precision issues and has no upper limit.