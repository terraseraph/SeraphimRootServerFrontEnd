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

  eventToEdit: any;
  actionToEdit: any;
  hintToEdit: any;
  triggerToEdit: any;

  constructor(
    public dataService: DataService,
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router
  ) {}

  ngOnInit() {
    this.scriptListSubscribe();
    this.scriptSubscribe();
    this.scriptLoaded = false;
    this.toggleFormPanelOff();
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

  loadScript(scriptName) {
    this.dataService.scriptEditor_setSelectedScript(scriptName);
  }

  deleteScript(scriptName) {
    console.log("Deleting: ", scriptName);
  }

  scriptEditEvent(eventName) {
    this.findEvent(eventName).then(evt => {
      this.eventToEdit = evt;
      this.toggleFormPanel("event");
    });
    console.log("Editing event: ", eventName);
  }
  scriptEditAction(actionName) {
    console.log("Editing Action: ", actionName);
    this.findAction(actionName).then(act => {
      this.actionToEdit = act;
      this.toggleFormPanel("action");
    });
  }

  scriptEditHint(hintName) {
    console.log("Editing Hint: ", hintName);
    this.findHint(hintName).then(hint => {
      this.hintToEdit = hint;
      this.toggleFormPanel("hint");
    });
  }

  scriptEditTrigger(triggerName) {
    console.log("Editing Trigger: ", triggerName);
    this.findAction(triggerName).then(trg => {
      this.triggerToEdit = trg;
      this.toggleFormPanel("trigger");
    });
  }

  scriptDeleteEvent(eventName) {
    console.log("Deleting: ", eventName);
  }
  scriptDeleteAction(actionName) {
    console.log("Deleting: ", actionName);
  }

  scriptDeleteHint(hintName) {
    console.log("Deleting: ", hintName);
  }

  scriptDeleteTrigger(triggerName) {
    console.log("Deleting: ", triggerName);
  }

  // ================ helpers =============//
  toggleFormPanel(panelType) {
    this.toggleFormPanelOff();
    switch (panelType) {
      case "event":
        this.eventLoaded = true;
        break;
      case "action":
        this.actionLoaded = true;
        break;
      case "trigger":
        this.triggerLoaded = true;
        break;
      case "hint":
        this.hintLoaded = true;
        break;
      default:
        break;
    }
  }

  toggleFormPanelOff() {
    this.eventLoaded = false;
    this.actionLoaded = false;
    this.hintLoaded = false;
    this.triggerLoaded = false;
  }
  findEvent(name) {
    return new Promise((resolve, reject) => {
      for (const evt of this.scriptInstance.events) {
        if (evt.name === name) {
          resolve(evt);
        }
      }
    });
  }

  findAction(name) {
    return new Promise((resolve, reject) => {
      for (const act of this.scriptInstance.actions) {
        if (act.name === name) {
          resolve(act);
        }
      }
    });
  }

  findHint(name) {
    return new Promise((resolve, reject) => {
      for (const hint of this.scriptInstance.hints) {
        if (hint.name === name) {
          resolve(hint);
        }
      }
    });
  }

  findTrigger(name) {
    return new Promise((resolve, reject) => {
      for (const trg of this.scriptInstance.triggers) {
        if (trg.name === name) {
          resolve(trg);
        }
      }
    });
  }
}
