import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import {
  RouterModule,
  Routes,
  Router,
  NavigationStart,
  ActivatedRoute
} from "@angular/router";

@Component({
  selector: "app-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.css"]
})
export class OverviewComponent implements OnInit {
  socketSubscription: Subscription;
  scriptSubscription: Subscription;
  hintText: any;
  time: any;
  script: any;
  scripts: any;
  scriptName: any;
  isDataAvailable = false;

  hours: any;
  minutes: any;
  seconds: any;

  constructor(
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    // this.loadScriptSubscribe();
  }

  ngOnInit() {
    // this.scriptSubscription = this.server.observableScript.subscribe(script => {
    //   this.script = script;
    //   this.isDataAvailable = true;
    // });
    this.socketSubscribe();
    this.loadScriptSubscribe();
  }

  get scriptChange(): any {
    return this.server.selectedScript;
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

  loadScript() {
    return new Promise((resolve, reject) => {
      resolve(this.server.selectedScript);
    });
  }

  loadScriptSubscribe() {
    this.scriptSubscription = this.server.observableScript.subscribe(script => {
      this.script = script;
      this.isDataAvailable = true;
    });
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
    this.server.startCustomTime(this.script.name, hrs, mins, sec).subscribe(time=>{
      console.log(time);
    });
  }

  startNewGame(){
    this.server.startNewGame(this.script, 0, 60, 0).subscribe(status => {
      console.log(status);
    });
  }

  endGame(){
    this.server.endGame(this.script.name).subscribe(result => {
      console.log(result)
      //reset the game params here
    });
  }
}
