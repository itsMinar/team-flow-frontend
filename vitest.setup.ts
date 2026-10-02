import { afterAll, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./src/test/server";

const promiseConstructor = Promise as PromiseConstructor & {
  withResolvers?: <T>() => {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  };
};

if (typeof promiseConstructor.withResolvers !== "function") {
  promiseConstructor.withResolvers = <T>() => {
    let resolvePromise: (value: T | PromiseLike<T>) => void = () => {};
    let rejectPromise: (reason?: unknown) => void = () => {};
    const promise = new Promise<T>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    return { promise, resolve: resolvePromise, reject: rejectPromise };
  };
}

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
