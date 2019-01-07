import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
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
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadAllScripts().then((scripts) => {
      this.isDataAvailable = true;
      this.scripts = scripts;
      this.socketSubscribe();
    });
  }

  loadAllScripts() {
    return new Promise((resolve, reject) => {
      this.server.loadScripts().subscribe(scripts => {
        // this.scripts = scripts;
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

  parseSocketMessage(msg: any){
    if(!msg.hasOwnProperty('instance_update')){
      return;
    }
    console.log("instance_update")
    for (let script of this.scripts){
      if(script.name == msg.instance_update.name.name){
        console.log("time updated", script)
        script.timeUpdate = msg.instance_update.time
      }
    }
  }

  loadScript(name) {
    this.server.loadScript(name).subscribe(script => {
      // this.server.selectedScript = script;
      this.server.setSelectedScript(script);
      this.router.navigateByUrl(`/overview`);
      // put the overview view loader here!!!
      console.log(script);
    });
  }
}
