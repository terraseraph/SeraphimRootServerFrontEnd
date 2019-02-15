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
  stateLoaded: boolean;

  eventToEdit: any;
  actionToEdit: any;
  hintToEdit: any;
  triggerToEdit: any;
  stateToEdit: any;

  eventStateSelect: any;
  eventEventTypeSelect: any;
  eventActionSelect: any;

  actionActionTypeSelect: any;
  actionStateSelect: any;
  actionStateDependencySelect: any;
  actionActionSelect: any;
  actionRepeatable: any;

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

  // ================================= //
  // ========= Script Selection ===== //
  // =============================== //
  scriptListSubscribe() {
    this.dataService.scriptEditor_getAllScripts();
    this.scriptListSubscription = this.dataService.scriptEditor_observableScriptList.subscribe(
      (scriptList: any) => {
        this.scriptInstanceList = scriptList;
      }
    );
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

  loadScript(scriptName) {
    this.dataService.scriptEditor_setSelectedScript(scriptName);
  }

  deleteScript(scriptName) {
    console.log("Deleting: ", scriptName);
  }

// ================================================= //
  // ========= Script config functions ===== //
  // ============================================== //

  scriptSaveConfig(){
    this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
    console.log("saved config");
  }

  // ================================= //
  // ========= Event functions ===== //
  // =============================== //

  scriptEditEvent(eventName) {
    this.findEvent(eventName).then(evt => {
      // this.newEventFlag = false;
      let e: any;
      e = evt;
      this.eventToEdit = evt;
      this.eventEventTypeSelect = `${e.eventType}/${e.event}`;
      this.toggleFormPanel("event");
    });
    console.log("Editing event: ", eventName);
  }

  scriptDeleteEvent(eventName) {
    for (let i = 0; i < this.scriptInstance.events.length; i++) {
      if (this.scriptInstance.events[i].name === eventName) {
        this.scriptInstance.events.splice(i, 1);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
        console.log("Deleting: ", eventName, this.scriptInstance.events);
      }
    }
  }

  scriptDeleteStateFromEvent(state) {
    const index = this.eventToEdit.states.indexOf(state);
    if (index !== -1) {
      this.eventToEdit.states.splice(index, 1);
    }
    console.log("Deleting: ", state);
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
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.eventToEdit.states.length; i++) {
        if (this.eventToEdit.states[i].name === stateName) {
          resolve(this.eventToEdit.states[i]);
        }
      }
    });
  }

  saveEditedEvent() {
    this.parseEventActionType(this.eventEventTypeSelect, "event").then(et => {
      let e: any;
      e = et;
      this.eventToEdit.event = e.event;
      this.eventToEdit.eventType = e.eventType;
      console.log(this.eventToEdit, this.scriptInstance, "ET: ", e);
      this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
    });
  }

  scriptCreateNewEvent() {
    this.dataService.newEventModel().then(eventModel => {
      let em: any;
      em = eventModel;
      em.name = "UNSET EVENT";
      this.scriptInstance.events.push(em);
    });
  }

  // ================================= //
  // ========= Action functions ===== //
  // =============================== //

  scriptEditAction(actionName) {
    console.log("Editing Action: ", actionName);
    this.findAction(actionName).then(act => {
      let a: any;
      a = act;
      this.actionActionTypeSelect = `${a.actionType}/${a.action}`;
      this.actionToEdit = a;
      if(this.actionToEdit.repeatable != typeof(Boolean)){
        this.actionToEdit.repeatable = true;
      }
      this.toggleFormPanel("action");
    });
  }

  scriptCreateNewAction() {
    this.dataService.newActionModel().then(actionModel => {
      let am: any;
      am = actionModel;
      am.name = "UNSET action";
      this.scriptInstance.actions.push(am);
    });
  }

  scriptDeleteAction(actionName) {
    for (let i = 0; i < this.scriptInstance.actions.length; i++) {
      if (this.scriptInstance.actions[i].name === actionName) {
        this.scriptInstance.actions.splice(i, 1);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
        console.log("Deleting: ", actionName, this.scriptInstance.actions);
      }
    }
  }

  scriptDeleteStateFromAction(state) {
    const index = this.actionToEdit.states.indexOf(state);
    if (index !== -1) {
      this.actionToEdit.states.splice(index, 1);
    }
    console.log("Deleting: ", state.name);
  }

  addDependencyToAction(depName) {
    this.actionToEdit.dependencies.push(depName);
  }

  deleteDependencyFromAction(depName) {
    const index = this.actionToEdit.dependencies.indexOf(depName);
    if (index !== -1) {
      this.actionToEdit.dependencies.splice(index, 1);
    }
  }

  addStateToCurrentAction(stateName) {
    console.log(this.actionStateSelect);
    this.findScriptState(stateName).then(state => {
      this.actionToEdit.states.push(state);
    });
  }

  toggleActionState(stateName) {
    for (let i = 0; i < this.actionToEdit.states.length; i++) {
      if (this.actionToEdit.states[i].name === stateName) {
        this.actionToEdit.states[i].active = !this.actionToEdit.states[i]
          .active;
        console.log(
          this.actionToEdit.states[i].name,
          this.actionToEdit.states[i].active
        );
        return;
      }
    }
  }

  toggleActionRepeatable(){
    this.actionToEdit.repeatable = !this.actionToEdit.repeatable;
  }

  addActiontoAction(actionName) {
    this.actionToEdit.actions.push(actionName);
  }

  deleteActionFromAction(actionName) {
    const index = this.actionToEdit.actions.indexOf(actionName);
    if (index !== -1) {
      this.actionToEdit.actions.splice(index, 1);
    }
  }

  saveEditedAction() {
    this.parseEventActionType(this.actionActionTypeSelect, "action").then(
      at => {
        let a: any;
        a = at;
        this.actionToEdit.action = a.action;
        this.actionToEdit.actionType = a.actionType;
        console.log(this.actionToEdit, this.scriptInstance, "AT: ", a);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
      }
    );
  }

  // ================================= //
  // ========= Hint functions ===== //
  // =============================== //

  scriptEditHint(hintName) {
    console.log("Editing Hint: ", hintName);
    this.findHint(hintName).then(hint => {
      this.hintToEdit = hint;
      this.toggleFormPanel("hint");
    });
  }

  scriptDeleteHint(hintName) {
    for (let i = 0; i < this.scriptInstance.hints.length; i++) {
      if (this.scriptInstance.hints[i].name === hintName) {
        this.scriptInstance.hints.splice(i, 1);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
        console.log("Deleting: ", hintName, this.scriptInstance.hints);
      }
    }
  }

  saveEditedHint() {
    this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
  }

  scriptCreateNewHint() {
    this.dataService.newHintModel().then(hintModel => {
      let hm: any;
      hm = hintModel;
      hm.name = "UNSET Hint";
      this.scriptInstance.hints.push(hm);
    });
  }

  // ================================= //
  // ========= States functions ===== //
  // =============================== //

  saveEditedState() {
    this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
  }

  scriptEditState(stateName) {
    console.log("Editing State: ", stateName);
    this.findState(stateName).then(state => {
      this.stateToEdit = state;
      this.toggleFormPanel("state");
    });
  }

  scriptDeleteState(stateName) {
    for (let i = 0; i < this.scriptInstance.states.length; i++) {
      if (this.scriptInstance.states[i].name === stateName) {
        this.scriptInstance.states.splice(i, 1);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
        console.log("Deleting: ", stateName, this.scriptInstance.states);
      }
    }
  }

  scriptCreateNewState() {
    this.dataService.newStateModel().then(stateModel => {
      let sm: any;
      sm = stateModel;
      sm.name = "UNSET State";
      this.scriptInstance.states.push(sm);
    });
  }

  // ================================= //
  // ========= Triggers functions ===== //
  // =============================== //

  scriptEditTrigger(triggerName) {
    console.log("Editing Trigger: ", triggerName);
    this.findTrigger(triggerName).then(trg => {
      this.triggerToEdit = trg;
      this.toggleFormPanel("trigger");
    });
  }

  scriptDeleteTrigger(triggerName) {
    for (let i = 0; i < this.scriptInstance.triggers.length; i++) {
      if (this.scriptInstance.triggers[i].name === triggerName) {
        this.scriptInstance.triggers.splice(i, 1);
        this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
        console.log("Deleting: ", triggerName, this.scriptInstance.triggers);
      }
    }
  }

  saveEditedTrigger() {
    this.dataService.scriptEditor_updateSelectedScript(this.scriptInstance);
  }

  scriptCreateNewTrigger() {
    this.dataService.newTriggerModel().then(triggerModel => {
      let tm: any;
      tm = triggerModel;
      tm.name = "UNSET Trigger";
      this.scriptInstance.triggers.push(tm);
    });
  }

  // ================ helpers =============//

  findScriptState(stateName) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.scriptInstance.states.length; i++) {
        if (this.scriptInstance.states[i].name === stateName) {
          resolve(this.scriptInstance.states[i]);
        }
      }
    });
  }
  parseEventActionType(input, type) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      const split = input.split("/");
      let result = {};
      if (type === "event") {
        result = {
          eventType: split[0],
          event: split[1]
        };
      } else {
        result = {
          actionType: split[0],
          action: split[1]
        };
      }
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
      case "state":
        this.stateLoaded = true;
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
    this.stateLoaded = false;
  }
  findEvent(name) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (const evt of this.scriptInstance.events) {
        if (evt.name === name) {
          resolve(evt);
        }
      }
    });
  }

  findAction(name) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (const act of this.scriptInstance.actions) {
        if (act.name === name) {
          resolve(act);
        }
      }
    });
  }

  findHint(name) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (const hint of this.scriptInstance.hints) {
        if (hint.name === name) {
          resolve(hint);
        }
      }
    });
  }

  findState(name) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (const state of this.scriptInstance.states) {
        if (state.name === name) {
          resolve(state);
        }
      }
    });
  }

  findTrigger(name) {
    // tslint:disable-next-line:no-shadowed-variable
    return new Promise((resolve, reject) => {
      for (const trg of this.scriptInstance.triggers) {
        if (trg.name === name) {
          resolve(trg);
        }
      }
    });
  }
}
