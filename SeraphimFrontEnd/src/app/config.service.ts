import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  public api = `http://localhost:4300`;
  constructor() {}

  public getApiUrl() {
    return this.api;
  }
}
