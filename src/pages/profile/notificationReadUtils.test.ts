import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createVisibilityDelayController,
  NotificationReadBuffer,
} from "./notificationReadUtils";

describe("createVisibilityDelayController", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires only after continuous visibility period", () => {
    vi.useFakeTimers();
    const onVisibleLongEnough = vi.fn();
    const controller = createVisibilityDelayController(1500, onVisibleLongEnough);

    controller.updateVisibility(true);
    vi.advanceTimersByTime(1499);
    expect(onVisibleLongEnough).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onVisibleLongEnough).toHaveBeenCalledTimes(1);
  });

  it("does not fire when visibility is interrupted, then fires after next full period", () => {
    vi.useFakeTimers();
    const onVisibleLongEnough = vi.fn();
    const controller = createVisibilityDelayController(1500, onVisibleLongEnough);

    controller.updateVisibility(true);
    vi.advanceTimersByTime(700);
    controller.updateVisibility(false);
    vi.advanceTimersByTime(2000);
    expect(onVisibleLongEnough).not.toHaveBeenCalled();

    controller.updateVisibility(true);
    vi.advanceTimersByTime(1500);
    expect(onVisibleLongEnough).toHaveBeenCalledTimes(1);
  });

  it("fires only once", () => {
    vi.useFakeTimers();
    const onVisibleLongEnough = vi.fn();
    const controller = createVisibilityDelayController(1500, onVisibleLongEnough);

    controller.updateVisibility(true);
    vi.advanceTimersByTime(1500);
    controller.updateVisibility(false);
    controller.updateVisibility(true);
    vi.advanceTimersByTime(5000);

    expect(onVisibleLongEnough).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationReadBuffer", () => {
  it("queues seen id only once and exposes payload ids", () => {
    const buffer = new NotificationReadBuffer();

    expect(buffer.addSeen(10)).toBe(true);
    expect(buffer.addSeen(10)).toBe(false);
    expect(buffer.getPayloadIds()).toEqual([10]);
  });

  it("keeps id in payload until acknowledge", () => {
    const buffer = new NotificationReadBuffer();
    buffer.addSeen(10);
    buffer.addSeen(11);

    buffer.acknowledge([10]);
    expect(buffer.getPayloadIds()).toEqual([11]);
  });

  it("marks locally seen notifications as read", () => {
    const buffer = new NotificationReadBuffer();
    buffer.addSeen(77);

    expect(buffer.isRead(77, false)).toBe(true);
    expect(buffer.isRead(78, false)).toBe(false);
    expect(buffer.isRead(78, true)).toBe(true);
  });
});
