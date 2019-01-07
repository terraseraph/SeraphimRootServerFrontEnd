import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SocketsService {
  private url = "localhost:4300";
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  /** Send a message over sockets */
  // sendMessage(channel_id, message, user, user_id, image = "") {
  //   console.log("MEssage sending :", message);
  //   const msg = {
  //     message: message,
  //     user: user,
  //     user_id: user_id,
  //     image: image
  //   };
  //   this.socket.emit("message", {
  //     room: channel_id,
  //     message: msg
  //   });
  // }

  sendForcedEvent(scriptName: any, eventName: any) {
    const msg = `{"name": "${scriptName}", "forceEvent": "true", "eventName":"${eventName}"}`;
    this.socket.emit("message", msg);
  }

  sendForcedAction(scriptName: any, actionName: any) {
    const msg = `{"name": "${scriptName}", "forceAction": true, "actionName":"${actionName}"}`;
    this.socket.emit("message", msg);
  }

  /** Join a channel */
  join_channel(channel_id, username) {
    const data = {
      id: channel_id,
      username: username
    };
    this.socket.emit("subscribe", data, function(dat) {
      console.log("JOINING CHANNEL");
      console.log(dat);
    });
  }

  /** Leave a channel */
  leave_channel(channel_id, username) {
    const data = {
      id: channel_id,
      username: username
    };
    this.socket.emit("unsubscribe", data, function(dat) {
      console.log(dat);
    });
  }

  /** Get all messages for the channel */
  getMessages() {
    return Observable.create(observer => {
      this.socket.on("message", message => {
        // console.log("Socket", message);
        observer.next(message);
      });
    });
  }
}
