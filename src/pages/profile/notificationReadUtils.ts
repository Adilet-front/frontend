type TimeoutHandle = ReturnType<typeof setTimeout>;

export interface VisibilityDelayController {
  updateVisibility: (isVisible: boolean) => void;
  dispose: () => void;
}

export const createVisibilityDelayController = (
  delayMs: number,
  onVisibleLongEnough: () => void,
): VisibilityDelayController => {
  let timeoutHandle: TimeoutHandle | null = null;
  let fired = false;

  const clearPendingTimeout = () => {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  };

  return {
    updateVisibility: (isVisible) => {
      if (fired) {
        return;
      }

      if (isVisible) {
        if (timeoutHandle) {
          return;
        }

        timeoutHandle = setTimeout(() => {
          timeoutHandle = null;
          fired = true;
          onVisibleLongEnough();
        }, delayMs);
        return;
      }

      clearPendingTimeout();
    },
    dispose: () => {
      clearPendingTimeout();
    },
  };
};

export class NotificationReadBuffer {
  private readonly queuedIds = new Set<number>();
  private readonly bufferedIds = new Set<number>();
  private readonly locallyReadIds = new Set<number>();

  addSeen(id: number): boolean {
    if (this.queuedIds.has(id)) {
      return false;
    }

    this.queuedIds.add(id);
    this.bufferedIds.add(id);
    this.locallyReadIds.add(id);
    return true;
  }

  getPayloadIds(): number[] {
    return Array.from(this.bufferedIds);
  }

  acknowledge(ids: number[]) {
    ids.forEach((id) => {
      this.bufferedIds.delete(id);
    });
  }

  isRead(id: number, serverIsRead: boolean): boolean {
    return serverIsRead || this.locallyReadIds.has(id);
  }

  getLocallyReadIds(): Set<number> {
    return new Set(this.locallyReadIds);
  }
}
