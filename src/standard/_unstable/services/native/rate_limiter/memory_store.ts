/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

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
   * @returns The current amount of requests received for `key` (`hits`) and
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
    this.#interval_id = setInterval(() => {
      this.#hits = {};
      this.#reset_time = this.#calculateNextResetTime(this.#timeframe);
    }, this.#timeframe);
  }
}
