import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.css"]
})
export class OverviewComponent implements OnInit {
  socketSubscription: Subscription;
  hintText: any;
  time: any;
  script: any;
  scripts: any;
  scriptName: any;
  loaded: boolean;

  hours: any;
  minutes: any;
  seconds: any;

  constructor(
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService
  ) {}

  ngOnInit() {
    this.loaded = false;
    this.loadAllScripts();
    this.socketSubscribe();
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

  sendHint() {
    console.log(this.hintText);
  }

  clearHint() {
    this.hintText = "";
  }

  loadScript(name) {
    this.server.loadScript(name).subscribe(script => {
      this.script = script;
      this.loaded = true;
      console.log(script);
    });
  }

  loadAllScripts() {
    this.server.loadScripts().subscribe(scripts => {
      this.scripts = scripts;
      this.loaded = true;
      this.script = scripts[0];
      console.log(scripts, "loaded: ", this.loaded);
      // this.loadScript(this.scripts[0]);
    });
  }

  sendForcedAction(actionName) {
    console.log(actionName);
    this.server
      .sendForcedAction(this.script.name, actionName)
      .subscribe(action => {
        console.log(action);
      });
    // this.socket.sendForcedAction(this.script.name, actionName);
  }

  sendForcedEvent(eventName) {
    console.log(eventName);
    this.server
      .sendForcedEvent(this.script.name, eventName)
      .subscribe(event => {
        console.log(event);
      });
    // this.socket.sendForcedEvent(this.script.name, eventName);
  }

  startCustomTimer() {
    let hrs, mins, sec;
    if (this.hours === "") {
      hrs = 0;
    }
    if (this.minutes === "") {
      mins = 0;
    }
    if (this.seconds === "") {
      sec = 0;
    }
    this.server.startCustomTime(this.script.name, hrs, mins, sec);
  }
}
