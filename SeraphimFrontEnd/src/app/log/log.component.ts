import { Component, OnInit } from "@angular/core";
import { BookingsService } from "../bookings.service";
import { SocketsService } from "../sockets.service";
import { loadavg } from "os";
@Component({
  selector: "app-log",
  templateUrl: "./log.component.html",
  styleUrls: ["./log.component.css"]
})
export class LogComponent implements OnInit {
  bookings: any;
  dataLoaded: boolean;
  logData: Array<any>;
  logStatus: Array<any>;
  logWarning: Array<any>;
  logInfo: Array<any>;
  logCritical: Array<any>;
  logError: Array<any>;
  constructor(
    public socket: SocketsService,
    public bookingService: BookingsService
  ) {}

  ngOnInit() {
    // this.getBookings();
    this.logData = [];
    this.logStatus = [];
    this.logWarning = [];
    this.logInfo = [];
    this.logCritical = [];
    this.logError = [];
    this.logsSubscribe();
  }

  logsSubscribe() {
    this.socket.getLogs().subscribe(data => {
      // console.log(data);
      this.circulateLogBuffers();
      if (data !== undefined) {
        // this.logData.push(JSON.stringify(data));
        this.filterLogs(data.message);
      }
    });
  }

  filterLogs(msg) {
    switch (msg.type) {
      case "info":
        this.logInfo.push(msg);
        break;
      case "status":
        this.logStatus.push(msg);
        break;
      case "warning":
        this.logWarning.push(msg);
        break;
      case "critical":
        this.logCritical.push(msg);
        break;
      case "error":
        this.logError.push(msg);
        break;
      default:
        this.logData.push(msg);
        break;
    }
  }

  circulateLogBuffers() {
    if (this.logInfo.length > 1000) {
      this.logInfo.splice(0, 100);
    }
    if (this.logStatus.length > 1000) {
      this.logStatus.splice(0, 100);
    }
    if (this.logWarning.length > 1000) {
      this.logWarning.splice(0, 100);
    }
    if (this.logCritical.length > 1000) {
      this.logCritical.splice(0, 100);
    }
    if (this.logError.length > 1000) {
      this.logError.splice(0, 100);
    }
    if (this.logData.length > 1000) {
      this.logData.splice(0, 100);
    }
  }

  getBookings() {
    this.bookingService.getUpcomingBookings().subscribe(data => {
      // this.bookings = data;
      this.bookings = data;
      this.dataLoaded = true;
      console.log(data);
      console.log(this.bookings);
    });
  }
}
