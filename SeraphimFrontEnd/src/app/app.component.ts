import { Component } from "@angular/core";
import { InitService } from "./init.service";
// import { SocketsService } from "./sockets.service"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "SeraphimFrontEnd";
  constructor(public init: InitService) {
    init.init();
    // socket.init();
  }
}
