import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_REQUESTED,
  requestConsentSettings,
  subscribeConsentSettings,
} from "../src/lib/consent";

async function withWindow(run: () => Promise<void>) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: new EventTarget(), configurable: true });
  try {
    await run();
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

test("an open request before mount reaches the subscriber after registration", async () => {
  await withWindow(async () => {
    requestConsentSettings();
    let opened = 0;
    const unsubscribe = subscribeConsentSettings(() => opened++);
    assert.equal(opened, 0, "registration must not update React state synchronously");
    await Promise.resolve();
    assert.equal(opened, 1, "the early click must open settings once");
    unsubscribe();
  });
});

test("unmount cancels a queued callback and leaves the request for a replacement", async () => {
  await withWindow(async () => {
    requestConsentSettings();
    let staleOpened = 0;
    const unsubscribe = subscribeConsentSettings(() => staleOpened++);
    unsubscribe();
    await Promise.resolve();
    assert.equal(staleOpened, 0);

    let currentOpened = 0;
    const stop = subscribeConsentSettings(() => currentOpened++);
    await Promise.resolve();
    assert.equal(currentOpened, 1);
    stop();
  });
});

test("mounted settings can reopen and unsubscribe stops updates", async () => {
  await withWindow(async () => {
    let opened = 0;
    const unsubscribe = subscribeConsentSettings(() => opened++);
    requestConsentSettings();
    assert.equal(opened, 1);
    window.dispatchEvent(new Event(CONSENT_REQUESTED));
    assert.equal(opened, 2, "the existing event contract still opens settings");
    requestConsentSettings();
    assert.equal(opened, 3, "a closed dialog can be reopened");

    unsubscribe();
    requestConsentSettings();
    await Promise.resolve();
    assert.equal(opened, 3, "removed subscribers must receive no updates");
    const consume = subscribeConsentSettings(() => {});
    await Promise.resolve();
    consume();
  });
});

test("early clicks coalesce and a live request does not open twice", async () => {
  await withWindow(async () => {
    requestConsentSettings();
    requestConsentSettings();
    let opened = 0;
    const unsubscribe = subscribeConsentSettings(() => opened++);
    requestConsentSettings();
    assert.equal(opened, 1);
    await Promise.resolve();
    assert.equal(opened, 1, "the pending microtask must not duplicate a delivered request");
    unsubscribe();
  });
});
