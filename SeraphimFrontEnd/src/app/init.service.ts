import { Injectable } from "@angular/core";
import { SocketsService } from "./sockets.service";
import { Subscription } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class InitService {
  socketSubscription: Subscription;
  constructor(public socket: SocketsService) {}

  init() {
    this.startSocket();
    // this.socket.init();
    console.log("Init service");
  }

  startSocket() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        // console.log("SOCKET: ", message);
      });
  }
}
