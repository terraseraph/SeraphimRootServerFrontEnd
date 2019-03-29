import { Injectable } from "@angular/core";
import { SocketsService } from "./sockets.service";
import { ServerService } from "./server.service";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { promise } from "protractor";
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

  // ========= Branch Server settings
  public branch_selectedBranch: any;
  public branch_allBranches: any;
  public branch_observableSelectedBranch: any;
  public branch_observableBranchList: any;

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

    this.branch_observableBranchList = new BehaviorSubject<any>(
      this.branch_allBranches
    );
    this.branch_observableSelectedBranch = new BehaviorSubject<any>(
      this.branch_selectedBranch
    );
    this.scriptEditor_getAllScripts();
  }

  // flow:
  // component subscribes to changes to script
  // component requests the data to be updated
  // data then updates and sends a .next to observables

  // ==============================
  // Branches
  // ==============================

  branch_observableUpdate() {
    this.branch_observableSelectedBranch.next(this.branch_getSelectedBranch());
  }

  branch_observableListUpdate() {
    this.branch_observableBranchList.next(this.branch_getAllBranches());
  }
  branch_subscribe(): Observable<any> {
    return this.branch_selectedBranch;
  }

  branch_setSelectedBranch(branchId) {
    this.branch_getAllBranches();
    this.findBranch(branchId).then(branch => {
      console.log("Setting editing branch to: ", branch);
      this.branch_selectedBranch = branch;
      this.branch_observableUpdate();
    });
  }

  branch_serverGetAllBranches() {
    this.server.readAllBranches().subscribe(branchList => {
      this.branch_allBranches = branchList;
      console.log(branchList);
      this.branch_observableListUpdate();
    });
  }



  branch_getScriptsForUploading(cb) {
    this.server.getFreshScriptsForEditing().subscribe((scriptList: any) => {
      this.scriptEditor_allScripts = scriptList;
      console.log(scriptList);
      cb(scriptList)
    });
  }

  branch_getSelectedBranch() {
    return this.branch_selectedBranch;
  }

  branch_getAllBranches() {
    return this.branch_allBranches;
  }

  branch_updateSelectedBranch(branch) {
    this.server.updateBranch(branch).subscribe(result => {
      console.log(result);
    });
  }

  branch_deleteBranch(id) {
    this.server.deleteBranch(id).subscribe(result => {
      console.log(result);
    });
  }

  branch_createNewBranch(name, ip) {
    let branch = new BranchModel(name, 1, ip);
    this.server.createBranch(branch).subscribe(result => {
      console.log(result);
      this.branch_allBranches.push(branch);
    });
  }

  findBranch(id) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.branch_allBranches.length; i++) {
        const branch = this.branch_allBranches[i];
        if (branch.id == id) {
          resolve(branch);
        }
      }
    });
  }

  branch_getAllBranchNodes(branchId) {
    this.server.getBridgeNodes(branchId).subscribe(nodes => {
      this.findBranch(branchId).then(branch => {
        branch["nodes"] = nodes;
        this.branch_observableListUpdate();
      });
    });
  }

  branch_editNodeCommonId(node) {
    var msg = {
      header: {
        branchAddress: node.branchAddress,
        bridgeId: node.bridgeId,
        nodeType: node.bridgeType
      },
      message: {
        id: node.bridgeId,
        message: {
          toId: node.nodeId,
          command: {
            type: "setId",
            message: node.newId
          }
        }
      }
    };
    this.server.editNodeCommonId(msg).subscribe(result => {
      console.log(result);
    });
  }

  /**
   *
   *
 {"id":"10",
 "message":{
  "toId" : "3209423301",
	"command" : {
		"type" : "functionChange",
		"toId": "3209423301",
		"message" : "button"
        }
  }
}
   *
   *
   */

  branch_editNodeType(node) {
    var msg = {
      header: {
        branchAddress: node.branchAddress,
        bridgeId: node.bridgeId,
        nodeType: node.bridgeType
      },
      message: {
        id: node.bridgeId,
        message: {
          toId: node.nodeId,
          command: {
            type: "functionChange",
            message: node.newType
          }
        }
      }
    };
    this.server.editNodeCommonId(msg).subscribe(result => {
      console.log(result);
    });
  }

  branch_sendNodeAction(node) {
    var actionPkt = this.createActionPacketToSend(
      node.nodeId,
      node.action,
      node.actionType,
      node.data
    );
    var msg = {
      header: {
        branchAddress: node.branchAddress,
        bridgeId: node.bridgeId,
        nodeType: node.bridgeType
      },
      message: {
        id: node.bridgeId,
        message: actionPkt
      }
    };
    this.server.sendNodeAction(msg).subscribe(result => {
      console.log(result);
    });
  }

  branch_deleteVideo(name, branchIp, cb) {
    let msg = {
      name: name,
      branchIp: branchIp,
      type: "video"
    };
    this.server.branchDeleteMedia(msg).subscribe(result => {
      console.log(result);
      cb(result);
    });
  }

  branch_deleteAudio(name, branchIp, cb) {
    let msg = {
      name: name,
      branchIp: branchIp,
      type: "audio"
    };
    this.server.branchDeleteMedia(msg).subscribe(result => {
      console.log(result);
      this.branch_observableUpdate();
      cb(result);
    });
  }

  branch_uploadVideo(fd, cb) {
    this.server.branchUploadVideo(fd).subscribe(res => {
      console.log(res);
      cb(res);
    });
  }

  branch_uploadAudio(fd, cb) {
    this.server.branchUploadAudio(fd).subscribe(res => {
      console.log(res);
      cb(res);
    });
  }

  branch_uploadScript(scriptName, ip) {
    this.findScript(scriptName).then(script => {
      let msg = {
        branchIp: ip,
        script: script
      }
      console.log(msg);
      this.server.branchUploadScript(msg).subscribe(result => {
        console.log(result);
      })
    })
  }

  branch_deleteScript(scriptName, ip) {
    let msg = {
      branchIp: ip,
      scriptName: scriptName
    }
    console.log(msg);

    this.server.branchDeleteScript(msg).subscribe(result => {
      console.log(result);
    });
  }


  branch_shellRestartBranch(ip) {
    let msg = {
      branchIp: ip
    }
    this.server.branchShellRestartBranch(msg).subscribe(result =>{

    })
  }

  branch_shellReloadBranchScreen(ip) {
    let msg = {
      branchIp: ip
    }
    this.server.branchShellReloadBranchScreen(msg).subscribe(result =>{

    })
  }

  branch_shellCustomCommand(ip, cmd) {
    let msg = {
      branchIp: ip,
      command: cmd
    }
    this.server.branchShellCustomCommand(msg).subscribe(result =>{

    })
  }


    branch_shellUpdateFromGit(ip) {
    let msg = {
      branchIp: ip
    }
    this.server.branchShellUpdateFromGit(msg).subscribe(result =>{

    })
  }

  // ==============================
  // Script editor
  // ==============================

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
    this.server.getFreshScriptsForEditing().subscribe((scriptList: any) => {
      this.scriptEditor_allScripts = scriptList;
      console.log(scriptList);
      this.scriptEditor_observableListUpdate();
    });
    // this.server.loadScripts().subscribe((scriptList: any) => {
    //   this.scriptEditor_allScripts = scriptList;
    //   console.log(scriptList);
    //   this.scriptEditor_observableListUpdate();
    // });
  }

  scriptEditor_updateSelectedScript(instanceUpdate) {
    for (let i = 0; i < this.scriptEditor_allScripts.length; i++) {
      if (this.scriptEditor_allScripts[i].name === instanceUpdate.name) {
        this.scriptEditor_allScripts[i] = instanceUpdate;
        this.scriptEditor_observableListUpdate();
        this.server.updateScript(instanceUpdate).subscribe(result => {
          console.log(result);
        });
        console.log(this.scriptEditor_allScripts);
      }
    }
  }

  scriptEditorSendHttpRequest(type, url, body = "") {
    let msg = {
      type: type,
      url: url,
      body: body
    };
    this.server.triggerSendHttpRequest(msg).subscribe(result => {
      console.log(result);
    });
  }

  // ==============================
  // Overview
  // ==============================

  overview_getNewScript(scriptName) {
    return new Promise((resolve, reject) => {
      this.findScript(scriptName).then(script => {
        resolve(script);
      });
    });
  }

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

  createActionPacketToSend(nodeId, action, actionType, data) {
    let result = {
      toId: nodeId,
      state: {
        type: "action",
        message: {
          action: action,
          actionType: actionType,
          data: data
        }
      }
    };
    return result;
  }

  findScript(scriptName) {
    return new Promise((resolve, reject) => {
      for (const instance of this.scriptEditor_allScripts) {
        if (instance.name === scriptName) {
          resolve(instance);
        }
      }
    });
  }

  newEventModel() {
    return new Promise((resolve, reject) => {
      const model = new ScriptEventModel();
      resolve(model);
    });
  }

  newActionModel() {
    return new Promise((resolve, reject) => {
      const model = new ScriptActionModel();
      resolve(model);
    });
  }

  newHintModel() {
    return new Promise((resolve, reject) => {
      const model = new ScriptHintModel();
      resolve(model);
    });
  }

  newTriggerModel() {
    return new Promise((resolve, reject) => {
      const model = new ScriptTriggerModel();
      resolve(model);
    });
  }

  newStateModel() {
    return new Promise((resolve, reject) => {
      const model = new ScriptStateModel();
      resolve(model);
    });
  }

  getNewScriptModel() {
    return new Promise((resolve, reject) => {
      let model = new EventActionScriptModel("UNSET SCRIPT");
      this.setDefaultEventsAndStates(model).then(s => {
        resolve(model);
      });
    });
  }

  newScreenConfigModel() {
    return new Promise((resolve, reject) => {
      const model = new ScreenConfigModel();
      resolve(model);
    });
  }

  setDefaultEventsAndStates(model: EventActionScriptModel) {
    return new Promise((resolve, reject) => {
      let startInstance = new ScriptStateModel();
      startInstance.name = "start_instance";

      let endInstance = new ScriptStateModel();
      endInstance.name = "end_instance";

      let timerComplete = new ScriptStateModel();
      timerComplete.name = "timer_complete";

      model.states.push(startInstance, endInstance, timerComplete);

      let eStartInstance = new ScriptEventModel();
      eStartInstance.name = "start_instnace";
      model.events.push(eStartInstance);

      let eEndInstance = new ScriptEventModel();
      eEndInstance.name = "end_instance";
      model.events.push(eEndInstance);

      resolve(model);
    });
  }

  newScriptModel() {
    const timeModel = {
      hours: "0",
      minutes: "60",
      seconds: "0"
    };
    const stateModel = {
      name: "",
      active: false
    };

    const eventModel = {
      id: "",
      name: "",
      device_id: "",
      event: "",
      eventType: "",
      data: "",
      description: "",
      dependencies: [],
      actions: [],
      message: "",
      states: []
    };

    const actionModel = {
      id: "",
      name: "",
      device_id: "",
      event: "",
      eventType: "",
      action: "",
      actionType: "",
      wait: 0,
      data: "",
      description: "",
      dependencies: [],
      repeatable: true,
      actions: [],
      message: "",
      states: []
    };

    const hintModel = {
      name: "",
      hint: ""
    };

    const triggerModel = {
      name: "",
      trigger: "",
      audio: "",
      video: "",
      hint: "",
      can_toggle: ""
    };

    const s = {
      name: "",
      id: "",
      branch_address: "",
      masterId: "",
      time: new ScriptTimeModel(),
      states: [new ScriptStateModel()],
      events: [new ScriptEventModel()],
      actions: [new ScriptActionModel()],
      hints: [new ScriptHintModel()],
      triggers: [new ScriptTriggerModel()]
    };
    // return new EventActionScriptModel("UNSET SCRIPT");
    return s;
  }
}

export class EventActionScriptModel {
  public name: string;
  public id: "";
  public branch_address: "";
  public masterId: "";
  public time = new ScriptTimeModel();
  public states: Array<ScriptStateModel>;
  public events: Array<ScriptEventModel>;
  public actions: Array<ScriptActionModel>;
  public hints: Array<ScriptHintModel>;
  public triggers: Array<ScriptTriggerModel>;
  public screenConfigs: Array<ScreenConfigModel>;
  constructor(name) {
    this.name = name;
    this.states = new Array<ScriptStateModel>();
    this.events = new Array<ScriptEventModel>();
    this.actions = new Array<ScriptActionModel>();
    this.hints = new Array<ScriptHintModel>();
    this.triggers = new Array<ScriptTriggerModel>();
    this.screenConfigs = new Array<ScreenConfigModel>();
  }
}

export class ScriptEventModel {
  public id: string;
  public name: string;
  public device_id: string;
  public event: string;
  public eventType: string;
  public data: string;
  public description: string;
  public dependencies: [];
  public actions: [];
  public message: string;
  public states = [];

  constructor() {
    this.id = "";
    this.name = "";
    this.device_id = "";
    this.event = "";
    this.eventType = "";
    this.data = "";
    this.description = "";
    this.dependencies = [];
    this.actions = [];
    this.message = "";
    this.states = [];
  }
}

export class ScriptActionModel {
  public id: string;
  public name: string;
  public device_id: string;
  public action: string;
  public actionType: string;
  public wait: Number;
  public data: string;
  public description: string;
  public dependencies: [];
  public repeatable: true;
  public actions: [];
  public message: string;
  public states: [];

  constructor() {
    this.id = "";
    this.name = "";
    this.device_id = "";
    this.action = "";
    this.actionType = "";
    this.data = "";
    this.description = "";
    this.dependencies = [];
    this.actions = [];
    this.message = "";
    this.states = [];
    this.wait = 0;
    this.repeatable = true;
  }
}

export class ScriptHintModel {
  public name: "";
  public hint: "";
}

export class ScreenConfigModel {
  public name = "";
  public backgroundType = "";
  public backgroundPath = "";
  public audio = "";
  public font = "'Times New Roman', Times, serif";
  public font_colour = "white";
  public showTimer = true;
  public showHints = true;
}

export class ScriptTriggerModel {
  public name: string;
  public trigger: string;
  public audio: string;
  public video: string;
  public hint: string;
  public can_toggle: string;
  public screenName: String;
  public httpRequestType: string;
  public httpRequestUrl: string;
  public httpRequestBody: string;

  constructor() {
    this.name = "";
    this.trigger = "";
    this.audio = "";
    this.video = "";
    this.hint = "";
    this.can_toggle = "";
    this.screenName = "";
    this.httpRequestType = "NONE";
    this.httpRequestUrl = "";
    this.httpRequestBody = "";
  }
}

export class ScriptStateModel {
  public name: string;
  public active: boolean;

  constructor() {
    this.name = "";
    this.active = false;
  }
}

export class ScriptTimeModel {
  public hours = "0";
  public minutes = "60";
  public seconds = "0";
}

export class BranchModel {
  public id: any;
  public name: any;
  public rootserver_id: any;
  public ip_address: any;
  constructor(name, rootId, ipAddress) {
    this.name = name;
    this.rootserver_id = rootId;
    this.ip_address = ipAddress;
  }
}

export class NodeBridgeModel {
  public id: any;
  public name: any;
  public ip_address: any;
  public branch_id: any;
  constructor(name, ip, branchId) {
    this.name = name;
    this.ip_address = ip;
    this.branch_id = branchId;
  }
}

export class NodeModel {
  public id: any;
  public name: any;
  public type: any;
  public last_alive: any;
  public bridge_id: any;

  constructor(name, type, lastAlive, bridgeId) {
    this.name = name;
    this.type = type;
    this.last_alive = lastAlive;
    this.bridge_id = bridgeId;
  }
}
