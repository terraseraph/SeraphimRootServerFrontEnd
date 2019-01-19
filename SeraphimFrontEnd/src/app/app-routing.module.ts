import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { SettingsComponent } from "./settings/settings.component";
import { OverviewComponent } from "./overview/overview.component";
import { MenuComponent } from "./menu/menu.component";
import { LogComponent } from "./log/log.component";
import { ScriptEditorComponent } from "./script-editor/script-editor.component";
import { EventActionScriptComponent } from "./event-action-script/event-action-script.component";

const routes: Routes = [
  { path: "settings", component: SettingsComponent },
  { path: "overview", component: OverviewComponent },
  { path: "menu", component: MenuComponent },
  { path: "log", component: LogComponent },
  { path: "script-editor", component: ScriptEditorComponent },
  { path: "event-action", component: EventActionScriptComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
