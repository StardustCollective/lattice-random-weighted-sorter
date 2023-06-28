import { bindAllMethods } from './bind_all_methods.js';

class Awaitable<T = any> implements Promise<T> {
  #promise: Promise<T>;
  #resolve?: (value: T) => void;
  #reject?: (reason?: any) => void;
  #status: 'initialized' | 'pending' | 'resolved' | 'rejected';

  constructor() {
    bindAllMethods(this);
    this.#promise = new Promise((rs, rj) => {
      this.#resolve = rs;
      this.#reject = rj;
      this.#status = 'pending';
    });
    this.#status = 'initialized';
  }

  get status() {
    return this.#status;
  }

  resolve(value: T) {
    if (this.#resolve) {
      this.#resolve(value);
      this.#status = 'resolved';
    } else {
      const trial = async (exec = 0) => {
        if (exec < 10) {
          if (this.#resolve) {
            this.#resolve(value);
            this.#status = 'resolved';
          } else {
            await new Promise((r) => setTimeout(r, 100));
            trial();
          }
        } else {
          throw new Error('Awaitable: Resolvers not initialized');
        }
      };
      trial();
    }
  }

  reject(reason: any) {
    if (this.#reject) {
      this.#reject(reason);
      this.#status = 'rejected';
    } else {
      const trial = async (exec = 0) => {
        if (exec < 10) {
          if (this.#reject) {
            this.#reject(reason);
            this.#status = 'rejected';
          } else {
            await new Promise((r) => setTimeout(r, 100));
            trial();
          }
        } else {
          throw new Error('Awaitable: Resolvers not initialized');
        }
      };
      trial();
    }
  }

  async then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }

  async catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<T | TResult> {
    return this.#promise.then(onrejected);
  }

  async finally(onfinally?: (() => void) | null): Promise<T> {
    return this.#promise.finally(onfinally);
  }

  [Symbol.toStringTag]!: string;
}

export { Awaitable };
