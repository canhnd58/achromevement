const utils = {

  Time: class {
    constructor (hour, minute = 0, second = 0) {
      if (hour === undefined) {
        const now = new Date();
        this.hour = now.getHours();
        this.minute = now.getMinutes();
        this.second = now.getSeconds();
      } else if (hour instanceof Date) {
        const d = hour;
        this.hour = d.getHours();
        this.minute = d.getMinutes();
        this.second = d.getSeconds();
      } else if (hour instanceof utils.Time) {
        const d = hour;
        this.hour = d.hour;
        this.minute = d.minute;
        this.second = d.second;
      } else {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
      }
    }

    valueOf () {
      return Date.UTC(1995, 10, 15, this.hour, this.minute, this.second);
    }

    toString () {
      const hh = this.hour.toString().padStart(2, '0');
      const mm = this.minute.toString().padStart(2, '0');
      const ss = this.second.toString().padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }
  },

  dayPassed: (d1, d2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const day1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const day2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    const milisec = Math.abs(day1 - day2);
    return Math.round(milisec / oneDay);
  },
};

export default utils;
