import { PromiseQueue, sequentialize } from "./sequentialize";
import { describe, expect, test } from "@jest/globals";

describe("PromiseQueue", () => {
  let queue: PromiseQueue;
  beforeEach(() => {
    queue = new PromiseQueue();
  });

  test("runs functions as they enter the queue", async () => {
    const f0 = jest.fn().mockResolvedValue(0);
    const f1 = jest.fn().mockResolvedValue(1);
    const f2 = jest.fn().mockResolvedValue(2);

    const result = await Promise.all([
      queue.enqueue(f0),
      queue.enqueue(f1),
      queue.enqueue(f2),
    ]);

    expect(result).toEqual([0, 1, 2]);
  });

  test("runs functions one at a time", async () => {
    let running = 0;
    let runningSet = new Set<any>();
    function start(x: unknown) {
      running++;
      runningSet.add(x);
      if (running > 1) {
        throw new Error(
          `Running ${running} > 1 functions.` +
            ` ${[...runningSet]} are running.`
        );
      }
    }
    function stop(x: unknown) {
      runningSet.delete(x);
      running--;
    }

    function makeMock<T>(x: T) {
      let done = false;
      let resolve: () => void | undefined;
      function finish() {
        done = true;
        if (resolve) {
          resolve();
        }
      }

      function waitFor(f: () => void) {
        if (done) {
          f();
        } else {
          resolve = f;
        }
      }

      let fn = () => {
        return new Promise((resolve) => {
          start(x);
          waitFor(() => {
            stop(x);
            resolve(x);
          });
        });
      };
      return [fn, finish] as const;
    }

    const [f0, finish0] = makeMock(0);
    const [f1, finish1] = makeMock(1);
    const [f2, finish2] = makeMock(2);

    const promises = Promise.all([
      queue.enqueue(f0),
      queue.enqueue(f1),
      queue.enqueue(f2),
    ]);

    finish1();
    finish0();
    finish2();

    expect(await promises).toEqual([0, 1, 2]);
  });

  test("reports errors", async () => {
    const f0 = jest.fn().mockRejectedValue("Oh no!");
    await expect(() => queue.enqueue(f0)).rejects.toEqual("Oh no!");
  });
});

describe("sequentialize", () => {
  test("makes a function run only one instance at a time", async () => {
    const runs: Array<() => void> = [];
    function f(x: number) {
      return new Promise<number>((resolve) => {
        runs[runs.length] = () => resolve(x);
      });
    }

    const s = sequentialize(f);
    const promise0 = s(0);
    const promise1 = s(1);
    const promise2 = s(2);

    expect(runs.length).toEqual(1);
    runs[0]();
    expect(await promise0).toEqual(0);

    expect(runs.length).toEqual(2);
    runs[1]();
    expect(await promise1).toEqual(1);

    expect(runs.length).toEqual(3);
    runs[2]();
    expect(await promise2).toEqual(2);

    expect(runs.length).toEqual(3);
  });
});
