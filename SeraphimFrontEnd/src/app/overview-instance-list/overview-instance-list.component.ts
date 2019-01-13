import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { DataService } from "../data.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import { RouterModule, Routes, Router } from "@angular/router";

@Component({
  selector: "app-overview-instance-list",
  templateUrl: "./overview-instance-list.component.html",
  styleUrls: ["./overview-instance-list.component.css"]
})
export class OverviewInstanceListComponent implements OnInit {
  scripts: any;
  socketSubscription: Subscription;
  isDataAvailable = false;

  constructor(
    public dataService: DataService,
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadAllScripts().then(scripts => {
      this.isDataAvailable = true;
      this.scripts = scripts;
      for (const s of this.scripts) {
        // NOTE: add specific values to check here
        s.timeUpdate = { hrs: 0, min: 0, sec: 0 };
        s.ended = false;
      }
      this.socketSubscribe();
    });
  }

  loadAllScripts() {
    return new Promise((resolve, reject) => {
      this.server.loadScripts().subscribe(scripts => {
        console.log(scripts, "loaded");
        resolve(scripts);
      });
    });
  }

  // to get the time and stuff
  socketSubscribe() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        this.parseSocketMessage(message);
        // foreach instance check if the name matches, then update the time
      });
  }

  parseSocketMessage(msg: any) {
    if (!msg.hasOwnProperty("instance_update")) {
      return;
    }
    for (const script of this.scripts) {
      if (script.name === msg.instance_update.script.name) {
        script.timeUpdate = msg.instance_update.time;
        script.ended = msg.instance_update.ended;
        // this.server.selectedScript.timeUpdate = msg.instance_update.time;
      }
    }
    this.server.updateLocalScripts(msg.instance_update);
  }

  loadScript(name) {
    this.server.loadScript(name).subscribe(script => {
      this.server.setSelectedScript(script);
      this.router.navigateByUrl(`/overview`);
      console.log(script);
    });
  }
}
