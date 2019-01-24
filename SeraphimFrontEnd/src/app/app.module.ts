import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { SettingsComponent } from "./settings/settings.component";
import { OverviewComponent } from "./overview/overview.component";
import { MenuComponent } from "./menu/menu.component";
import { LogComponent } from "./log/log.component";
import { EventActionScriptComponent } from "./event-action-script/event-action-script.component";
import { InitService } from "./init.service";
import { SocketsService } from "./sockets.service";
import { OverviewEventActionListComponent } from "./overview-event-action-list/overview-event-action-list.component";
import { OverviewInstanceListComponent } from "./overview-instance-list/overview-instance-list.component";
import { ScriptEditorComponent } from "./script-editor/script-editor.component";

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    OverviewComponent,
    MenuComponent,
    LogComponent,
    EventActionScriptComponent,
    OverviewEventActionListComponent,
    OverviewInstanceListComponent,
    ScriptEditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [InitService],
  bootstrap: [AppComponent]
})
export class AppModule {}
