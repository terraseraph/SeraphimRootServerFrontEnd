import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { DataService } from "../data.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import { RouterModule, Routes, Router } from "@angular/router";

@Component({
  selector: "app-script-editor",
  templateUrl: "./script-editor.component.html",
  styleUrls: ["./script-editor.component.css"]
})
export class ScriptEditorComponent implements OnInit {
  scriptSubscription: Subscription;
  scriptListSubscription: Subscription;
  scriptInstance: any;
  scriptInstanceList: any;
  scriptLoaded = false;

  eventLoaded: boolean;
  actionLoaded: boolean;
  hintLoaded: boolean;
  triggerLoaded: boolean;

  constructor(
    public dataService: DataService,
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router
  ) {}

  ngOnInit() {
    this.scriptLoaded = false;
    this.scriptListSubscribe();
    this.scriptSubscribe();
    this.loadScriptInstances();
  }

  scriptSubscribe() {
    this.scriptSubscription = this.dataService.scriptEditor_observableSelectedScript.subscribe(
      (script: any) => {
        console.log("selected script for editing: ", script);
        this.scriptInstance = script;
        this.scriptLoaded = true;
      }
    );
  }

  scriptListSubscribe() {
    this.dataService.scriptEditor_getAllScripts();
    this.scriptListSubscription = this.dataService.scriptEditor_observableScriptList.subscribe(
      (scriptList: any) => {
        this.scriptInstanceList = scriptList;
      }
    );
  }

  loadScriptInstances() {}

  loadScript(scriptName) {
    this.dataService.scriptEditor_setSelectedScript(scriptName);
  }
}
