import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-overview-event-action-list",
  templateUrl: "./overview-event-action-list.component.html",
  styleUrls: ["./overview-event-action-list.component.css"]
})
export class OverviewEventActionListComponent implements OnInit {
  script: any;
  socketSubscription: Subscription;

  constructor(
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService
  ) {}

  ngOnInit() {
    this.loadScript();
  }

  loadScript() {
    this.script = this.server.selectedScript;
  }

  sendForcedAction(actionName) {
    console.log(actionName);
    this.server
      .sendForcedAction(this.script.name, actionName)
      .subscribe(action => {
        console.log(action);
      });
    this.socket.sendForcedAction(this.script.name, actionName);
  }

  sendForcedEvent(eventName) {
    console.log(eventName);
    this.server
      .sendForcedEvent(this.script.name, eventName)
      .subscribe(event => {
        console.log(event);
      });
    this.socket.sendForcedEvent(this.script.name, eventName);
  }

  socketSubscribe() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        if (message.script_name === this.script.name) {
          if (message.event !== undefined || message.event !== "") {
            this.eventStatus(message.event);
          }
        }
      });
  }

  eventStatus(event) {
    this.script.events.forEach(evt => {
      if (evt.name === event.name) {
        evt.status = event.status;
      }
    });
  }

  actionStatus(action) {
    this.script.actions.forEach(act => {
      if (act.name === action.name) {
        act.status = action.status;
      }
    });
  }
}
