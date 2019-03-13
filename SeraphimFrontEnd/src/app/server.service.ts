import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { ConfigService } from "./config.service";
@Injectable({
  providedIn: "root"
})
export class ServerService {
  public api = `http://192.168.0.180:4300`;
  public scriptInstances: any;
  public selectedScript: any;
  public selectedScriptInstance: any;
  public observableScript: any;

  constructor(private http: HttpClient, public config: ConfigService) {
    // Seleceted will throw errors otherwise... TODO: put elsewhere
    this.selectedScript = {
      name: "Select a script",
      timeUpdate: { hrs: 0, min: 0, sec: 0 }
    };
    this.observableScript = new BehaviorSubject<any>(this.selectedScript);
    this.scriptInstances = [];
    this.api = config.getApiUrl();
  }

  scriptChange() {
    this.observableScript.next(this.selectedScript);
  }

  setSelectedScript(script) {
    this.selectedScript = script;
    this.scriptChange();
  }

  // Script CRUD
  createScript(script): Observable<any> {
    return this.http.post(`${this.api}/script`, script);
  }

  loadScript(name): Observable<any> {
    this.http.get(`${this.api}/game/${name}`).subscribe(scriptInstance => {
      this.selectedScriptInstance = scriptInstance;
      console.log(scriptInstance);
    });
    return this.http.get(`${this.api}/script/${name}`);
  }
  loadScripts(): Observable<any> {
    this.http.get(`${this.api}/game`).subscribe(scriptInstances => {
      this.scriptInstances = scriptInstances;
    });
    return this.http.get(`${this.api}/script`);
  }

  updateScript(script): Observable<any> {
    return this.http.put(`${this.api}/script`, script);
  }

  deleteScript(script): Observable<any> {
    return this.http.delete(`${this.api}/script/${script}`);
  }

  getFreshScriptsForEditing(): Observable<any> {
    return this.http.get(`${this.api}/scriptf`);
  }

  // ==========================================//
  // ======== Branches =======================//
  // =========================================//

  createBranch(branch: any): Observable<any> {
    return this.http.post(`${this.api}/branch`, branch);
  }

  readBranch(id): Observable<any> {
    console.log("Server reading branch", id);
    return this.http.get(`${this.api}/branch/${id}`);
  }

  readAllBranches(): Observable<any> {
    console.log("Server reading branches");
    return this.http.get(`${this.api}/branch`);
  }

  updateBranch(branch): Observable<any> {
    return this.http.put(`${this.api}/branch`, branch);
  }

  deleteBranch(id): Observable<any> {
    return this.http.delete(`${this.api}/branch/${id}`);
  }

  // ==========================================//
  // ======== Nodes =======================//
  // =========================================//

  getBridgeNodes(branchId) {
    return this.http.get(`${this.api}/branch/nodes/${branchId}`);
  }

  // ==========================================//
  // ======== Overview =======================//
  // =========================================//
  loadOverview(scriptName): Observable<any> {
    return this.http.get(`${this.api}/getOverview/${scriptName}`);
  }

  sendForcedAction(scriptName, actionName): Observable<any> {
    const msg = {
      name: scriptName,
      forceAction: actionName
    };
    console.log(msg);
    // return this.http.post(`${this.api}/force/action`, msg);
    return this.http.post(`${this.api}/game/force/action`, msg);
  }

  sendForcedEvent(scriptName, eventName, completedTime): Observable<any> {
    const msg = {
      name: scriptName,
      forceEvent: eventName,
      completedTime: completedTime
    };
    console.log(msg);
    // return this.http.post(`${this.api}/force/event`, msg);
    return this.http.post(`${this.api}/game/force/event`, msg);
  }

  startCustomTime(scriptName: any, h: any, m: any, s: any): Observable<any> {
    const msg = {
      name: scriptName,
      time: { hours: h, minutes: m, seconds: s }
    };
    return this.http.put(`${this.api}/game/time`, msg);
  }

  updateCustomTime(scriptName: any, h: any, m: any, s: any): Observable<any> {
    const msg = {
      name: scriptName,
      update: "true",
      time: { hours: h, minutes: m, seconds: s }
    };
    return this.http.put(`${this.api}/game/time`, msg);
  }

  startNewGame(scriptName: any, h: any, m: any, s: any): Observable<any> {
    const msg = {
      name: scriptName,
      timeLimit: {
        hours: h,
        minutes: m,
        seconds: s
      }
    };
    console.log(msg);
    return this.http.post(`${this.api}/game`, msg);
  }

  pauseGameTimer(scriptName: any): Observable<any> {
    return this.http.get(`${this.api}/game/time/pause/${scriptName}`);
  }

  resumeGameTimer(scriptName: any): Observable<any> {
    return this.http.get(`${this.api}/game/time/resume/${scriptName}`);
  }

  endGame(scriptName: any): Observable<any> {
    return this.http.delete(`${this.api}/game/${scriptName}`);
  }

  updateLocalScripts(instanceUpdate: any) {
    let exist = false;
    this.scriptInstances.forEach(script => {
      if (script.name === instanceUpdate.name) {
        script = instanceUpdate;

        if (this.selectedScript.name === instanceUpdate.name) {
          this.selectedScript.timeUpdate = instanceUpdate.timeUpdate;
        }

        exist = true;
      }
    });
    if (!exist) {
      this.scriptInstances.push(instanceUpdate);
    }
  }

  updateScreenConfiguration(scriptName, config): Observable<any> {
    let msg = {
      config: config,
      scriptName: scriptName,
      screenName: config.name
    };
    return this.http.post(`${this.api}/branch/config`, msg);
  }

  // ======================================================================= //
  // ========================== TRIGGERS  ================================== //
  // ======================================================================= //
  triggerForceTrigger(msg): Observable<any> {
    console.log("Forcing trigger: ", msg);

    return this.http.post(`${this.api}/branch/trigger`, msg);
  }

  triggerPlayAudio(msg): Observable<any> {
    console.log("Playing: ", msg);

    return this.http.post(`${this.api}/branch/trigger/audio`, msg);
  }

  triggerPlayVideo(msg): Observable<any> {
    console.log("Playing: ", msg);

    return this.http.post(`${this.api}/branch/trigger/video`, msg);
  }

  triggerSendHttpRequest(msg): Observable<any> {
    return this.http.post(`${this.api}/trigger/request`, msg);
  }

  // ======================================================================= //
  // ========================== HINTS  ===================================== //
  // ======================================================================= //

  hintSendHint(msg): Observable<any> {
    console.log("SendingHint: ", msg);

    return this.http.post(`${this.api}/branch/hint`, msg);
  }

  hintSendCustomHint(msg): Observable<any> {
    console.log(msg);
    return this.http.post(`${this.api}/branch/hint`, msg);
  }

  clearHint(msg): Observable<any> {
    console.log(msg);
    return this.http.post(`${this.api}/branch/hint/clear`, msg);
  }
}
