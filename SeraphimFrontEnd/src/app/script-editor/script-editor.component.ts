import { Component, OnInit } from "@angular/core";
import { ServerService } from "../server.service";
import { SocketsService } from "../sockets.service";
import { DataService } from "../data.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import { RouterModule, Routes, Router } from "@angular/router";
import { resolve } from "path";
import { ParsedEventType } from "@angular/compiler";

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

  eventStateSelect: any;
  eventEventTypeSelect: any;
  eventActionSelect: any;

  // newEventFlag: boolean;

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
      // this.newEventFlag = false;
      this.eventToEdit = evt;
      this.eventEventTypeSelect = `${evt.eventType}/${evt.event}`;
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
    for (let i = 0; i < this.scriptInstance.events.length; i++) {
      if (this.scriptInstance.events[i].name === eventName) {
        this.scriptInstance.events.splice(i, 1);
        console.log("Deleting: ", eventName, this.scriptInstance.events);
      }
    }
    // const index = this.scriptInstance.events.indexOf(eventName);
    // if (index !== -1) {
    //   this.scriptInstance.events.splice(index, 1);
    // }
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

  scriptDeleteStateFromEvent(stateName) {
    console.log("Deleting: ", stateName);
  }

  scriptDeleteStateFromAction(stateName) {
    console.log("Deleting: ", stateName);
  }

  // ================ Event state toggle ======//

  toggleEventState(stateName) {
    for (let i = 0; i < this.eventToEdit.states.length; i++) {
      if (this.eventToEdit.states[i].name === stateName) {
        this.eventToEdit.states[i].active = !this.eventToEdit.states[i].active;
        console.log(
          this.eventToEdit.states[i].name,
          this.eventToEdit.states[i].active
        );
        return;
      }
    }
  }

  addStateToCurrentEvent(stateName) {
    console.log(this.eventStateSelect);
    this.findScriptState(stateName).then(state => {
      this.eventToEdit.states.push(state);
    });
  }

  addActiontoEvent(actionName) {
    this.eventToEdit.actions.push(actionName);
  }

  deleteActionFromEvent(actionName) {
    const index = this.eventToEdit.actions.indexOf(actionName);
    if (index !== -1) {
      this.eventToEdit.actions.splice(index, 1);
    }
  }

  addDependencyToEvent(depName) {
    this.eventToEdit.dependencies.push(depName);
  }

  deleteDependencyFromEvent(depName) {
    const index = this.eventToEdit.dependencies.indexOf(depName);
    if (index !== -1) {
      this.eventToEdit.dependencies.splice(index, 1);
    }
  }

  findEventState(stateName) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.eventToEdit.states.length; i++) {
        if (this.eventToEdit.states[i].name === stateName) {
          resolve(this.eventToEdit.states[i]);
        }
      }
    });
  }

  findScriptState(stateName) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.scriptInstance.states.length; i++) {
        if (this.scriptInstance.states[i].name === stateName) {
          resolve(this.scriptInstance.states[i]);
        }
      }
    });
  }

  saveEditedEvent() {
    this.parseEventType(this.eventEventTypeSelect).then(et => {
      this.eventToEdit.event = et.event;
      this.eventToEdit.eventType = et.eventType;
      console.log(this.eventToEdit, this.scriptInstance, "ET: ", et);
      // if(this.newEventFlag){
      //   this.scriptInstance.events.push(this.eventToEdit);
      // }
      this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
    });
  }

  scriptCreateNewEvent(){
    // const eventModel = {
    //   id: "",
    //   name: "",
    //   device_id: "",
    //   event: "",
    //   eventType: "",
    //   data: "",
    //   description: "",
    //   dependencies: [],
    //   actions: [],
    //   message: "",
    //   states: []
    // };
    this.dataService.newEventModel().then(eventModel =>{
      this.scriptInstance.events.push(eventModel);
      this.eventToEdit = eventModel;
    });
    // this.scriptInstance.events.push(eventModel);
      // this.eventToEdit = eventModel;
    // this.toggleFormPanel("event");
    console.log(this.eventToEdit);
  }

  // ================ helpers =============//
  parseEventType(input) {
    return new Promise((resolve, reject) => {
      const split = input.split("/");
      const result = {
        eventType: split[0],
        event: split[1]
      };
      resolve(result);
    });
  }

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
