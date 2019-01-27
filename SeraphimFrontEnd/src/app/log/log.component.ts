import { Component, OnInit } from "@angular/core";
import { BookingsService } from "../bookings.service";
@Component({
  selector: "app-log",
  templateUrl: "./log.component.html",
  styleUrls: ["./log.component.css"]
})
export class LogComponent implements OnInit {
  bookings: any;
  dataLoaded: boolean;
  constructor(public bookingService: BookingsService) {}

  ngOnInit() {
    this.getBookings();
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
