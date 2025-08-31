import { scheduleBackground } from './scheduler.js';

class SyntheticLoop {
  constructor() {
    this.tasks = [[], [], [], []]; // 0=input,1=anim,2=render,3=bg
    this.running = false;
    this.lastTime = performance.now();
    this._boundLoop = this._loop.bind(this);
  }

  enqueue(lane, fn) {
    this.tasks[lane].push(fn);
    if (!this.running) {
      this.running = true;
      requestAnimationFrame(this._boundLoop);
    }
  }

  _loop(timestamp) {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this._flush(this.tasks[0]); // input
    this._flush(this.tasks[1], dt); // anim
    this._flush(this.tasks[2]); // render

    if (this.tasks[3].length) {
      const bgTasks = this.tasks[3].slice();
      this.tasks[3].length = 0;
      scheduleBackground(() => this._flush(bgTasks));
    }

    requestAnimationFrame(this._boundLoop);
  }

  _flush(queue, dt) {
    for (let i = 0, l = queue.length; i < l; i++) {
      try {
        queue[i](dt);
      } catch (e) {
        console.error('[SyntheticLoop]', e);
      }
    }
    queue.length = 0;
  }

  input(fn) { this.enqueue(0, fn); }
  animation(fn) { this.enqueue(1, fn); }
  render(fn) { this.enqueue(2, fn); }
  background(fn) { this.enqueue(3, fn); }
}

export const syntheticLoop = new SyntheticLoop();
