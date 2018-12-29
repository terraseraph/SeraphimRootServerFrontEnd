import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ArrayType } from "@angular/compiler";

@Injectable({
  providedIn: "root"
})
export class ServerService {
  public api = `http://localhost:5001`;
  public scripts: any;
  public selectedScript: any;

  constructor(private http: HttpClient) {}

  // Script CRUD
  createScript(script): Observable<any> {
    return this.http.post(`${this.api}/script`, script);
  }

  loadScript(name): Observable<any> {
    // this.selectedScript =
    return this.http.get(`${this.api}/script/${name}`);
  }
  loadScripts(): Observable<any> {
    // this.scripts =
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
      hours: h,
      minutes: m,
      seconds: s
    };
    return this.http.put(`${this.api}/game/time`, msg);
  }
}
