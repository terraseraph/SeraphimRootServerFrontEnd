import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import { DataService } from "../data.service";
import {
  RouterModule,
  Routes,
  Router,
  NavigationStart,
  ActivatedRoute
} from "@angular/router";
import { promise } from "protractor";

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
    private route: ActivatedRoute,
    public dataService: DataService
  ) {
    // this.loadScriptSubscribe();
  }

  ngOnInit() {
    // this.loadScriptSubscribe();
    // this.socketSubscribe();
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

  startNewGame() {
    this.script = null;
    this.loadScript().then(loadedScript => {
      console.log(loadedScript);
      this.script = loadedScript;
      const t = this.script.time;
      this.server
        .startNewGame(
          this.script,
          parseInt(t.hours, 10),
          parseInt(t.minutes, 10),
          parseInt(t.seconds, 10)
        )
        .subscribe(status => {
          console.log(status);
          this.sendForcedEvent("start_instance");
        });
    });
  }

  endGame() {
    this.server.endGame(this.script.name).subscribe(result => {
      console.log(result);
      // reset the game params here
    });
  }

  // ======================================================================= //
  // ========================= SOCKET MESSAGES  ============================ //
  // ======================================================================= //

  socketSubscribe() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        if (message.hasOwnProperty("instance_update")) {
          if (message.instance_update.name === this.script.name) {
            this.parseSocketMessage(message);
          }
        }
        if (message.hasOwnProperty("event")) {
          this.eventStatus(message.event);
        }
      });
  }

  parseSocketMessage(msg: any) {
    return new Promise((resolve, reject) => {
      if (!msg.hasOwnProperty("instance_update")) {
        return;
      }
      this.script.events = msg.instance_update.script.events;
      this.script.actions = msg.instance_update.script.actions;
      this.script.timeUpdate = msg.instance_update.time;
      this.script.ended = msg.instance_update.ended;
      this.script.states = msg.instance_update.states;
      console.log("==== socket message", msg, this.script);
      resolve();
    });
  }

  // ======================================================================= //
  // ========================== TIMER  ===================================== //
  // ======================================================================= //

  startCustomTimer() {
    let hrs, mins, sec;
    if (this.hours === "") {
      hrs = 0;
    } else {
      hrs = parseInt(this.hours, 10);
    }
    if (this.minutes === "") {
      mins = 0;
    } else {
      mins = parseInt(this.minutes, 10);
    }
    if (this.seconds === "") {
      sec = 0;
    } else {
      sec = parseInt(this.seconds, 10);
    }
    this.server
      .startCustomTime(this.script.name, hrs, mins, sec)
      .subscribe(time => {
        console.log(time);
      });
  }
  updateCustomTimer() {
    let hrs, mins, sec;
    if (this.hours === "") {
      hrs = 0;
    } else {
      hrs = parseInt(this.hours, 10);
    }
    if (this.minutes === "") {
      mins = 0;
    } else {
      mins = parseInt(this.minutes, 10);
    }
    if (this.seconds === "") {
      sec = 0;
    } else {
      sec = parseInt(this.seconds, 10);
    }
    this.server
      .updateCustomTime(this.script.name, hrs, mins, sec)
      .subscribe(time => {
        console.log("======= Updated time =======", time);
      });
  }

  pauseGameTimer() {
    this.server.pauseGameTimer(this.script.name).subscribe(result => {
      console.log(result);
    });
  }

  resumeGameTimer() {
    this.server.resumeGameTimer(this.script.name).subscribe(result => {
      console.log(result);
    });
  }

  // ======================================================================= //
  // ========================== EVENT ACTION  ============================== //
  // ======================================================================= //

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
      .sendForcedEvent(this.script.name, eventName, this.script.timeUpdate)
      .subscribe(event => {
        console.log(event);
      });
    this.socket.sendForcedEvent(this.script.name, eventName);
  }

  eventStatus(event) {
    this.script.events.forEach(evt => {
      if (evt.name === event.name) {
        evt.status = event.status;
        evt.completed_time = this.script.timeUpdate;
        console.log("Updating Event: ", this.script);
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

  // ======================================================================= //
  // ========================== TRIGGERS  ================================== //
  // ======================================================================= //
  triggerForceTrigger(trigger) {
    const msg = {
      scriptName: this.script.name,
      trigger: trigger
    };
    this.server.triggerForceTrigger(msg).subscribe(result => {
      console.log("Forcing trigger: ", result);
    });
  }

  triggerPlayAudio(audioFile) {
    const msg = {
      scriptName: this.script.name,
      audioFile: audioFile
    };
    this.server.triggerPlayAudio(msg).subscribe(result => {
      console.log("Playing Audio: ", result);
    });
  }

  triggerPlayVideo(videoFile) {
    const msg = {
      scriptName: this.script.name,
      videoFile: videoFile
    };
    this.server.triggerPlayVideo(msg).subscribe(result => {
      console.log("Playing Video: ", result);
    });
  }

  // ======================================================================= //
  // ========================== HINTS  ===================================== //
  // ======================================================================= //

  hintSendHint(hint) {
    const msg = {
      scriptName: this.script.name,
      hintText: this.hintText
    };
    this.hintText = hint.hint;
    this.server.hintSendHint(msg).subscribe(result => {
      console.log("Sending hint: ", result);
    });
  }

  hintSendCustomHint() {
    const msg = {
      scriptName: this.script.name,
      hintText: this.hintText
    };
    this.server.hintSendCustomHint(msg).subscribe(result => {
      console.log("Sending hint: ", result);
    });
  }

  clearHint() {
    const msg = {
      scriptName: this.script.name,
      hintText: "--clear--"
    };
    this.hintText = "";
    this.server.clearHint(msg).subscribe(result => {
      console.log("Clearing hint: ", result);
    });
  }
}
