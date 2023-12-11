import clc from 'cli-color';
import { DateTime } from 'luxon';

export class Logger {
  startTime: number;
  endTime: number;
  constructor(private readonly name: string) {}

  clearTimer() {
    this.startTime = 0;
  }
  setStart() {
    this.startTime = DateTime.now().toMillis();
  }

  log(message: string) {
    if (this.startTime) {
      this.endTime = DateTime.now().toMillis();
      let unitOfTime = 'ms';
      let timeElapsed = this.endTime - this.startTime;
      if (timeElapsed < 60000) {
        timeElapsed = timeElapsed / 1000;
        unitOfTime = 's';
      } else if (timeElapsed < 3600000) {
        timeElapsed = timeElapsed / 60000;
        unitOfTime = 'm';
      } else {
        timeElapsed = timeElapsed / 3600000;
        unitOfTime = 'h';
      }
      return console.log(
        clc.green('[' + this.name + ']:') +
          ` ${message} ` +
          clc.yellow(`(${timeElapsed.toFixed(2)}${unitOfTime})`),
      );
    }

    return console.log(clc.green('[' + this.name + ']:') + ` ${message}`);
  }
}
