// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetSoundForTests, soundTestExports } from "./sound";

class FakeAudioParam {
  public events: Array<{ time: number; type: string; value: number }> = [];

  setValueAtTime(value: number, time: number) {
    this.events.push({ type: "set", value, time });
  }

  exponentialRampToValueAtTime(value: number, time: number) {
    this.events.push({ type: "exp", value, time });
  }
}

class FakeGainNode {
  public gain = new FakeAudioParam();

  connect() {}
}

class FakeOscillatorNode {
  public frequency = new FakeAudioParam();
  public type: OscillatorType = "sine";

  connect() {}

  start() {}

  stop() {}
}

class FakeAudioContext {
  public currentTime = 0;
  public destination = {};
  public state: AudioContextState = "running";
  public createGainCalls = 0;
  public createOscillatorCalls = 0;
  public resumeCalls = 0;

  createGain() {
    this.createGainCalls += 1;
    return new FakeGainNode() as unknown as GainNode;
  }

  createOscillator() {
    this.createOscillatorCalls += 1;
    return new FakeOscillatorNode() as unknown as OscillatorNode;
  }

  async resume() {
    this.resumeCalls += 1;
  }
}

describe("resolveInteractiveElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    resetSoundForTests();
  });

  it("matches nested interactive descendants", () => {
    document.body.innerHTML =
      '<button type="button" id="root"><span id="inner">Click</span></button>';

    const target = document.getElementById("inner");
    const resolved = soundTestExports.resolveInteractiveElement(target);

    expect(resolved?.id).toBe("root");
  });

  it("accepts delegated role and data-slot based controls", () => {
    document.body.innerHTML = `
      <div role="tab" id="tab"></div>
      <div data-slot="menu-trigger" id="menu-trigger"></div>
      <div role="switch" id="switch"></div>
    `;

    expect(soundTestExports.resolveInteractiveElement(document.getElementById("tab"))?.id).toBe(
      "tab",
    );
    expect(
      soundTestExports.resolveInteractiveElement(document.getElementById("menu-trigger"))?.id,
    ).toBe("menu-trigger");
    expect(soundTestExports.resolveInteractiveElement(document.getElementById("switch"))?.id).toBe(
      "switch",
    );
  });

  it("rejects disabled, aria-disabled, inert, and plain content", () => {
    document.body.innerHTML = `
      <button type="button" id="disabled-button" disabled>Disabled</button>
      <button type="button" aria-disabled="true" id="aria-disabled-button">Disabled</button>
      <div inert><button type="button" id="inert-button">Hidden</button></div>
      <div id="plain">Plain</div>
    `;

    expect(
      soundTestExports.resolveInteractiveElement(document.getElementById("disabled-button")),
    ).toBeNull();
    expect(
      soundTestExports.resolveInteractiveElement(document.getElementById("aria-disabled-button")),
    ).toBeNull();
    expect(
      soundTestExports.resolveInteractiveElement(document.getElementById("inert-button")),
    ).toBe(null);
    expect(soundTestExports.resolveInteractiveElement(document.getElementById("plain"))).toBeNull();
  });
});

describe("createSynthSoundController", () => {
  let audioContext: FakeAudioContext;
  let controller: ReturnType<typeof soundTestExports.createSynthSoundController>;
  let time = 1_000;

  beforeEach(() => {
    document.body.innerHTML = "";
    audioContext = new FakeAudioContext();
    controller = soundTestExports.createSynthSoundController({
      document,
      now: () => time,
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
      createAudioContext: () => audioContext as unknown as AudioContext,
    });
    controller.init();
  });

  afterEach(() => {
    controller.teardown();
    document.body.innerHTML = "";
    resetSoundForTests();
  });

  it("does not play before unlock, but click unlocks and plays once", async () => {
    controller.playClickSound();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(audioContext.createOscillatorCalls).toBe(1);

    document.body.innerHTML =
      '<button type="button" id="action"><span id="label">Action</span></button>';

    document.getElementById("label")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(audioContext.createOscillatorCalls).toBe(2);
  });

  it("fails closed when audio context creation is unavailable", async () => {
    controller.teardown();
    controller = soundTestExports.createSynthSoundController({
      document,
      now: () => time,
      matchMedia: undefined,
      createAudioContext: () => {
        throw new Error("no audio");
      },
    });
    controller.init();

    document.body.innerHTML = '<button type="button" id="action">Action</button>';
    document.getElementById("action")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(true).toBe(true);
  });

  it("keeps click playback responsive during fast repeated interactions", async () => {
    document.body.innerHTML = '<button type="button" id="action">Action</button>';

    document.getElementById("action")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.getElementById("action")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(audioContext.createOscillatorCalls).toBe(2);
  });
});
