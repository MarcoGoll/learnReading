/**
 * Round logic for read-aloud levels: a queue of items that are judged, skipped (moved to the end),
 * or marked "not yet" (removed), with one-step undo.
 */
class ReadingRound {
  /**
   * Creates a round.
   * @param {Array} items - Items of the round in display order.
   */
  constructor(items) {
    this.queue = [...items];
    this.resultList = [];
    this.lastSnapshot = null;
  }

  /**
   * Returns the current item.
   * @returns {*} Current item or undefined when finished.
   */
  current() {
    return this.queue[0];
  }

  /**
   * Returns a copy of the results.
   * @returns {Array<{item: *, result: string}>} Results.
   */
  results() {
    return [...this.resultList];
  }

  /**
   * Checks whether all items are done.
   * @returns {boolean} True when the queue is empty.
   */
  isFinished() {
    return this.queue.length === 0;
  }

  /**
   * Checks whether the last action can be undone.
   * @returns {boolean} True if undo is possible.
   */
  canUndo() {
    return this.lastSnapshot !== null;
  }

  /**
   * Records the current item as correct or wrong.
   * @param {boolean} isCorrect - Judgement.
   */
  judge(isCorrect) {
    this.finishCurrent(isCorrect ? 'correct' : 'wrong');
  }

  /**
   * Removes the current item from the round without counting it.
   */
  notYet() {
    this.finishCurrent('notYet');
  }

  /**
   * Moves the current item to the end of the queue.
   */
  skip() {
    if (this.queue.length > 1) {
      this.queue.push(this.queue.shift());
    }
  }

  /**
   * Undoes the last judgement or "not yet".
   * @returns {{item: *, result: string}|null} The undone result or null.
   */
  undo() {
    if (!this.lastSnapshot) {
      return null;
    }
    const undone = this.resultList[this.resultList.length - 1];
    this.queue = this.lastSnapshot.queue;
    this.resultList = this.lastSnapshot.results;
    this.lastSnapshot = null;
    return undone;
  }

  /**
   * Stores a snapshot for undo and moves the current item into the results.
   * @param {string} result - "correct", "wrong", or "notYet".
   */
  finishCurrent(result) {
    this.lastSnapshot = { queue: [...this.queue], results: [...this.resultList] };
    this.resultList.push({ item: this.queue.shift(), result });
  }
}

/**
 * Creates the round logic for read-aloud levels.
 * @param {Array} items - Items of the round in display order.
 * @returns {ReadingRound} Round.
 */
export function createReadingRound(items) {
  return new ReadingRound(items);
}

/**
 * Returns the items of a result list that were judged correct.
 * @param {Array<{item: *, result: string}>} results - Round results.
 * @returns {Array} Correct items.
 */
export function correctItems(results) {
  return results.filter((entry) => entry.result === 'correct').map((entry) => entry.item);
}
