import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ServerService {
  public api = `http://localhost:4300`;
  public scriptInstances: any;
  public selectedScript: any;
  public selectedScriptInstance: any;
  public observableScript: any;

  constructor(private http: HttpClient) {
    // Seleceted will throw errors otherwise... TODO: put elsewhere
    this.selectedScript = {
      name: "Select a script",
      timeUpdate: { hrs: 0, min: 0, sec: 0 }
    };
    this.observableScript = new BehaviorSubject<any>(this.selectedScript);
    this.scriptInstances = [];
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
    this.http.get(`${this.api}/game/name`).subscribe(scriptInstance => {
      this.selectedScriptInstance = scriptInstance;
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
    return this.http.post(`${this.api}/force/action`, msg);
  }

  sendForcedEvent(scriptName, eventName): Observable<any> {
    const msg = {
      name: scriptName,
      forceEvent: eventName
    };
    console.log(msg);
    return this.http.post(`${this.api}/force/event`, msg);
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
}
