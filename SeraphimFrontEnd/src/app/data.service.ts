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

  scriptEditor_updateSelectedScript() {
    // this.server.updateScript();
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
    this.scriptInstanceListChange();
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
}
