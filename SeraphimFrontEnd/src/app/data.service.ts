import { Injectable } from "@angular/core";
import { SocketsService } from "./sockets.service";
import { ServerService } from "./server.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
@Injectable({
  providedIn: "root"
})
export class DataService {
  public scriptInstances: any; // JSON objct of instances
  public selectedScriptInstance: any;
  public observableScript: any;
  socketSubscription: Subscription;

  constructor(public server: ServerService, public socket: SocketsService) {
    this.observableScript = new BehaviorSubject<any>(
      this.selectedScriptInstance
    );
  }

  selectedScriptInstanceChange() {
    this.observableScript.next(this.selectedScriptInstance);
  }

  setSelectedScriptInstance(script) {
    this.selectedScriptInstance = script;
    this.selectedScriptInstanceChange();
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
  // ==================== Socket updates ========================
}
