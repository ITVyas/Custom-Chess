export function formatDate(ms) {
    const date = new Date(ms);
    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, "0");
    const D = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

export class Observer {
    constructor() {
      this.observers = [];
    }
  
    subscribe(func) {
      this.observers.push(func);
    }
  
    unsubscribe(func) {
      this.observers = this.observers.filter((observer) => observer !== func);
    }
  
    notify(data) {
      this.observers.forEach((observer) => observer(data));
    }
}

export function convertDateToInt(dateStr) {
    const [datePart, timePart] = dateStr.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split(':');

    // Создаем объект Date, учитывая что год начинается с 2000 (для формата YY)
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

    // Получаем количество миллисекунд с 1 января 1970 года
    return date.getTime();
}

export function convertDatetimeUTCStrToMySQLDatetime(datetimeStr) {
    return new Date(datetimeStr).toISOString().slice(0, 19).replace("T", " ");
}

