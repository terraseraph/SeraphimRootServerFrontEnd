import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  public api = `http://192.168.0.180:4300`;
  constructor() {}

  public getApiUrl() {
    return this.api;
  }
}
