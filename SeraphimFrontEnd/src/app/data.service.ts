import { Injectable } from "@angular/core";
import { SocketsService } from "./sockets.service";
import { ServerService } from "./server.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
@Injectable({
  providedIn: "root"
})
export class DataService {
  // ======= instance overview data TODO: implement
  public scriptInstances: any; // JSON objct of instances
  public selectedScriptInstance: any;
  public observableScriptInstance: any;
  public observableScriptInstanceList: any;
  public socketSubscription: Subscription;

  // ======== Script editor data
  public scriptEditor_selectedScript: any;
  public scriptEditor_allScripts: any;
  public scriptEditor_observableSelectedScript: any;
  public scriptEditor_observableScriptList: any;

  constructor(public server: ServerService, public socket: SocketsService) {
    this.observableScriptInstance = new BehaviorSubject<any>(
      this.selectedScriptInstance
    );
    this.scriptEditor_observableSelectedScript = new BehaviorSubject<any>(
      this.scriptEditor_selectedScript
    );
    this.scriptEditor_observableScriptList = new BehaviorSubject<any>(
      this.scriptEditor_allScripts
    );
  }

  // ==============================
  // Script editor
  // ==============================

  // flow:
  // component subscribes to changes to script
  // component requests the data to be updated
  // data then updates and sends a .next to observables

  scriptEditor_observableUpdate() {
    this.scriptEditor_observableSelectedScript.next(
      this.scriptEditor_getSelectedScript()
    );
  }

  scriptEditor_observableListUpdate() {
    this.scriptEditor_observableScriptList.next(
      this.scriptEditor_getAllLocalScripts()
    );
  }
  scriptEditor_subscribe(): Observable<any> {
    return this.scriptEditor_selectedScript;
  }

  scriptEditor_setSelectedScript(scriptName) {
    this.findScript(scriptName).then(script => {
      // console.log("Setting editing script to: ", scriptName, script);
      this.scriptEditor_selectedScript = script;
      this.scriptEditor_observableUpdate();
    });
  }

  scriptEditor_getSelectedScript() {
    return this.scriptEditor_selectedScript;
  }

  scriptEditor_getAllLocalScripts() {
    return this.scriptEditor_allScripts;
  }

  scriptEditor_getAllScripts() {
    this.server.loadScripts().subscribe((scriptList: any) => {
      this.scriptEditor_allScripts = scriptList;
      console.log(scriptList);
      this.scriptEditor_observableListUpdate();
    });
  }

  scriptEditor_updateSelectedScript(instanceUpdate) {
    for (let i = 0; i < this.scriptEditor_allScripts.length; i++) {
      if (this.scriptEditor_allScripts[i].name === instanceUpdate.name) {
        this.scriptEditor_allScripts[i] = instanceUpdate;
        this.scriptEditor_observableListUpdate();
        this.server.updateScript(instanceUpdate).subscribe(result => {
          console.log(result);
        });
        console.log(this.scriptEditor_allScripts);
      }
    }
  }

  // ==============================
  // Overview
  // ==============================

  selectedScriptInstanceChange() {
    this.observableScriptInstance.next(this.selectedScriptInstance);
  }

  setSelectedScriptInstance(script) {
    this.selectedScriptInstance = this.scriptInstances[`${script.name}`];
    // this.selectedScriptInstance = script;
    this.selectedScriptInstanceChange();
  }

  scriptInstanceListChange() {
    this.observableScriptInstanceList.next(this.scriptInstances);
  }

  // TODO:
  // Make the callers eg overview - call data.serveice, data.service then updates its scripts
  createInstanceModel(sInstance: any) {
    const sModel = {
      name: sInstance.name,
      time: { hrs: 0, min: 0, sec: 0 },
      ended: "false",
      states: [],
      script: sInstance
    };

    this.scriptInstances[`${sModel.name}`] = sModel;
  }

  getLocalScriptInstance(InstanceName): Observable<any> {
    return this.scriptInstances[`${InstanceName}`];
  }

  updateLocalScriptInstance(instanceUpdate) {
    this.scriptInstances[`${instanceUpdate.name}`] = instanceUpdate;
  }

  deleteLocalScriptInstance(instanceName) {
    this.scriptInstances[`${instanceName}`] = null;
  }

  // ==================== Calls to server =======================
  initLoadAllScriptInstances() {
    this.server.loadScripts().subscribe(instances => {
      for (const key of instances) {
        this.createInstanceModel(instances[`${key}`]);
      }
    });
  }

  serverLoadScript(name) {
    this.server.loadScript(name).subscribe(script => {
      this.selectedScriptInstance = script;
      console.log("=====TEST NEW DATA SERVICE =====", script);
      this.selectedScriptInstanceChange();
    });
  }
  // ==================== Socket updates ========================

  // ==================== Helpers ========================

  findScript(scriptName) {
    return new Promise((resolve, reject) => {
      for (const instance of this.scriptEditor_allScripts) {
        if (instance.name === scriptName) {
          resolve(instance);
        }
      }
    });
  }

  newEventModel() {
    return new Promise((resolve, reject) => {
      resolve(new ScriptEventModel());
    });
  }

  newActionModel() {
    return new ScriptActionModel();
  }

  newHintModel() {
    return new ScriptHintModel();
  }

  newTriggerModel() {
    return new ScriptTriggerModel();
  }

  newStateModel() {
    return new ScriptStateModel();
  }

  newScriptModel() {
    const timeModel = {
      hours: "0",
      minutes: "60",
      seconds: "0"
    };
    const stateModel = {
      name: "",
      active: false
    };

    const eventModel = {
      id: "",
      name: "",
      device_id: "",
      event: "",
      eventType: "",
      data: "",
      description: "",
      dependencies: [],
      actions: [],
      message: "",
      states: []
    };

    const actionModel = {
      id: "",
      name: "",
      device_id: "",
      event: "",
      eventType: "",
      action: "",
      actionType: "",
      wait: 0,
      data: "",
      description: "",
      dependencies: [],
      repeatable: true,
      actions: [],
      message: "",
      states: []
    };

    const hintModel = {
      name: "",
      hint: ""
    };

    const triggerModel = {
      name: "",
      trigger: "",
      audio: "",
      video: "",
      hint: "",
      can_toggle: ""
    };

    const s = {
      name: "",
      id: "",
      branch_address: "",
      masterId: "",
      time: new ScriptTimeModel(),
      states: [new ScriptStateModel()],
      events: new ScriptEventModel(),
      actions: new ScriptActionModel(),
      hints: [new ScriptHintModel()],
      triggers: [new ScriptTriggerModel()]
    };
    return new EventActionScriptModel();
  }
}

export class EventActionScriptModel {
  public name: "";
  public id: "";
  public branch_address: "";
  public masterId: "";
  public time: ScriptTimeModel;
  public states: [ScriptStateModel];
  public events: ScriptEventModel;
  public actions: ScriptActionModel;
  public hints: [ScriptHintModel];
  public triggers: [ScriptTriggerModel];
}

export class ScriptEventModel {
  public id: string;
  public name: string;
  public device_id: string;
  public event: string;
  public eventType: string;
  public data: string;
  public description: string;
  public dependencies: [];
  public actions: [];
  public message: string;
  public states = [];

  constructor() {
    this.id = "";
    this.name = "";
    this.device_id = "";
    this.event = "";
    this.eventType = "";
    this.data = "";
    this.description = "";
    this.dependencies = [];
    this.actions = [];
    this.message = "";
    this.states = [];
  }
}

export class ScriptActionModel {
  public id: "";
  public name: "";
  public device_id: "";
  public event: "";
  public eventType: "";
  public action: "";
  public actionType: "";
  public wait: 0;
  public data: "";
  public description: "";
  public dependencies: [];
  public repeatable: true;
  public actions: [];
  public message: "";
  public states: [];
}

export class ScriptHintModel {
  public name: "";
  public hint: "";
}

export class ScriptTriggerModel {
  public name: "";
  public trigger: "";
  public audio: "";
  public video: "";
  public hint: "";
  public can_toggle: "";
}

export class ScriptStateModel {
  public name: "";
  public active: false;
}

export class ScriptTimeModel {
  public hours: "0";
  public minutes: "60";
  public seconds: "0";
}
