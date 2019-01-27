import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class BookingsService {
  bookings: any;
  api: any;
  secretKey: any;
  apiKey: any;
  productsUrl: any;
  bookingsUrl: any;
  startTime: any;
  endTime: any;

  constructor(private http: HttpClient) {
    this.api = "https://api.bookeo.com/v2/";
    this.secretKey = "secretKey=7RrMyipwOpedho7XwsrGFoKvSAi7nAp8";
    this.apiKey = "apiKey=ARUF9PN63MTWK9FXJK7H33350CPFK9Y1583F6ECD42";
    this.createStartTime().then(sTime => {
      this.startTime = sTime;
      this.createEndTime().then(eTime => {
        this.endTime = eTime;
      });
    });
  }

  getUpcomingBookings(): Observable<any> {
    return this.http.get(
      `${this.api}bookings?startTime=${this.startTime}&endTime=${
        this.endTime
      }&${this.secretKey}&${this.apiKey}`
    );
  }

  createStartTime() {
    return new Promise((resolve, reject) => {
      const d = new Date();
      const monthNum = d.getMonth() + 1;
      const monthStr = monthNum.toString().padStart(2, "0");
      const dayStr = d
        .getDate()
        .toString()
        .padStart(2, "0");
      const result = `${d.getFullYear()}-${monthStr}-${dayStr}T00:00:00-00:00`;
      resolve(result);
    });
  }

  createEndTime() {
    return new Promise((resolve, reject) => {
      const date = new Date();
      this.promiseDateAdd(date, "day", 30).then(da => {
        let d: any;
        d = da;
        const monthNum = d.getMonth() + 1;
        const monthStr = monthNum.toString().padStart(2, "0");
        const dayStr = d
          .getDate()
          .toString()
          .padStart(2, "0");
        const result = `${d.getFullYear()}-${monthStr}-${dayStr}T00:00:00-00:00`;
        resolve(result);
      });
    });
  }

  promiseDateAdd(date, interval, units) {
    return new Promise((resolve, reject) => {
      resolve(this.dateAdd(date, interval, units));
    });
  }

  dateAdd(date, interval, units) {
    let ret = new Date(date); // don't change original date
    const checkRollover = function() {
      if (ret.getDate() !== date.getDate()) {
      }
      ret.setDate(0);
    };
    switch (interval.toLowerCase()) {
      case "year":
        ret.setFullYear(ret.getFullYear() + units);
        checkRollover();
        break;
      case "quarter":
        ret.setMonth(ret.getMonth() + 3 * units);
        checkRollover();
        break;
      case "month":
        ret.setMonth(ret.getMonth() + units);
        checkRollover();
        break;
      case "week":
        ret.setDate(ret.getDate() + 7 * units);
        break;
      case "day":
        ret.setDate(ret.getDate() + units);
        break;
      case "hour":
        ret.setTime(ret.getTime() + units * 3600000);
        break;
      case "minute":
        ret.setTime(ret.getTime() + units * 60000);
        break;
      case "second":
        ret.setTime(ret.getTime() + units * 1000);
        break;
      default:
        ret = undefined;
        break;
    }
    return ret;
  }
}
