/**
 * Runs promises one at a time
 */
export class PromiseQueue {
    private running = false;
    private queue: Array<() => Promise<unknown>> = []

    constructor() {}

    enqueue<T>(f: () => Promise<T>): Promise<T> {
        const p = new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    resolve(await f());
                } catch (e) {
                    reject(e);
                } finally {
                    this.running = false;
                    this.update();
                }
            });
        });
        this.update();
        return p;
    }

    private update() {
        if (this.running || this.queue.length === 0) {
            return;
        }
        this.running = true;
        this.queue.shift()!();
    }
}

/**
 * Runs only one instance of a function at a time
 */
export function sequentialize<A extends Array<any>, R, F extends (...args: A) => Promise<R>>(f: F): F {
    const queue = new PromiseQueue();
    return ((...args: Parameters<F>) =>
        queue.enqueue<R>(() => f(...args))) as F;
}
