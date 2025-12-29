import type { H3Event } from "h3";

export class Context<T> {
  #map = new WeakMap<H3Event<any>, T>();

  public set(event: H3Event<any>, value: T) {
    this.#map.set(event, value);
  }

  public get(event: H3Event<any>): T {
    if (this.#map.has(event)) {
      return this.#map.get(event)!;
    }
    throw new Error("context not found");
  }

  public tryGet(event: H3Event<any>): T | undefined {
    return this.#map.get(event);
  }
}

export function createContext<T>() {
  return new Context<T>();
}
