export class MemoryStore {
  #hits: Record<string, number> = {};
  #interval_id: number | null = null;
  #reset_time: Date;
  #timeframe: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param timeframe - Reset time/duration
   */
  constructor(timeframe: number) {
    this.#reset_time = this.#calculateNextResetTime(timeframe);
    this.#timeframe = timeframe;
    this.#queueReset();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Mainly used in tests, to cleanup ops
   */
  public cleanup() {
    if (this.#interval_id) {
      clearInterval(this.#interval_id);
    }
  }

  /**
   * Increase the number of hits given the ip
   *
   * @param key - The IP of the request
   *
   * @returns The current amount of requests recieved for `key` (`hits`) and
   * the reset time
   */
  public increment(key: string): {
    current: number;
    reset_time: Date;
  } {
    if (this.#hits[key]) {
      this.#hits[key]++;
    } else {
      this.#hits[key] = 1;
    }

    return {
      current: this.#hits[key],
      reset_time: this.#reset_time,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the next reset time given the timeframe.
   *
   * @param timeframe - Essentially, current time + timeframe.
   *
   * @returns The new reset time.
   */
  #calculateNextResetTime(timeframe: number): Date {
    const d = new Date();
    d.setMilliseconds(d.getMilliseconds() + timeframe);
    return d;
  }

  /**
   * Start an interval to reset the hits and reset time based on the timeframe.
   */
  #queueReset() {
    this.#interval_id= setInterval(() => {
      this.#hits = {};
      this.#reset_time = this.#calculateNextResetTime(this.#timeframe);
    }, this.#timeframe);
  }
}

