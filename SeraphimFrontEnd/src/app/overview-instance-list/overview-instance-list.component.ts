import {
  Component,
  OnInit,
  ViewChild,
  PLATFORM_ID,
  Inject
} from "@angular/core";
import { ServerService } from "../server.service";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { SocketsService } from "../sockets.service";
import { DataService } from "../data.service";
import { InitService } from "../init.service";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import {
  RouterModule,
  Routes,
  Router,
  ActivatedRoute,
  Event,
  NavigationEnd
} from "@angular/router";
import { SlicePipe } from "@angular/common";
import * as $ from "jquery";
import { promise } from "protractor";

@Component({
  selector: "app-overview-instance-list",
  templateUrl: "./overview-instance-list.component.html",
  styleUrls: ["./overview-instance-list.component.css"]
})
export class OverviewInstanceListComponent implements OnInit {
  scripts: any;
  socketSubscription: Subscription;
  isDataAvailable = false;

  branchNodeSubscription: Subscription;
  allBranches: any;

  routeSubscription: Subscription;

  @ViewChild("slickModal", { static: false }) slickModal: any;
  @ViewChild("actionModal", { static: false }) actionModal: any;
  @ViewChild("eventModal", { static: false }) eventModal: any;
  @ViewChild("triggerModal", { static: false }) triggerModal: any;
  @ViewChild("audioModal", { static: false }) audioModal: any;
  @ViewChild("videoModal", { static: false }) videoModal: any;

  // For modal views
  tempScriptName: any;
  tempEventToShow: any;
  tempTriggersToShow: any;

  // For node updates on events/actions
  eventNodeUpdates: any;
  actionNodeUpdates: any;

  showCards = false;

  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: true,
    infinite: false,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  constructor(
    public dataService: DataService,
    public server: ServerService,
    public socket: SocketsService,
    public init: InitService,
    public router: Router,
    public route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.loadAllScripts().then(scripts => {
      this.isDataAvailable = true;
      this.scripts = scripts;
      for (const s of this.scripts) {
        // NOTE: add specific values to check here
        s.timeUpdate = { hours: 0, minutes: 0, seconds: 0 };
        s.ended = false;
      }
      this.socketSubscribe();
    });
    this.routeSubscribe();
    this.branchNodeSubscribe();
    this.eventNodeUpdates = [];
    this.actionNodeUpdates = [];
  }

  routeSubscribe() {
    this.routeSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === "/overview") {
          this.showInstances(true);
        } else {
          this.showInstances(false);
        }
      }
    });
  }

  showInstances(canShow) {
    this.showCards = canShow;
  }

  toggleInstances() {
    this.showCards = !this.showCards;
  }

  loadAllScripts() {
    return new Promise((resolve, reject) => {
      this.server.loadScripts().subscribe(scripts => {
        console.log(scripts, "loaded");
        resolve(scripts);
      });
    });
  }

  // to get the time and stuff
  socketSubscribe() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        this.parseSocketMessage(message);
        // console.log(message);
        // foreach instance check if the name matches, then update the time
      });
  }

  parseSocketMessage(msg: any) {
    if (msg.hasOwnProperty("toaster") || msg.hasOwnProperty("alert")) {
      this.showToaster(msg);
    }
    if (msg.hasOwnProperty("instance_update")) {
      for (const script of this.scripts) {
        if (script.name === msg.instance_update.script.name) {
          script.events = msg.instance_update.script.events;
          script.actions = msg.instance_update.script.actions;
          script.timeUpdate = msg.instance_update.time;
          script.ended = msg.instance_update.ended;
          script.states = msg.instance_update.states;
          script.displayedHint = msg.instance_update.displayedHint;
        }
      }
      this.updateEventNodeStatus();
      this.server.updateLocalScripts(msg.instance_update);
    }
  }

  updateEventNodeStatus() {
    for (const script of this.scripts) {
      for (let event of script.events) {
        for (const nEvt of this.eventNodeUpdates) {
          if (nEvt.eventName === event.name) {
            event.alive = nEvt.nodeStatus;
          }
        }
      }
    }
  }

  loadScript(name) {
    this.server.loadScript(name).subscribe(script => {
      this.server.setSelectedScript(script);
      // this.dataService.setSelectedScriptInstance(script);
      this.router.navigateByUrl(`/overview`);
      console.log(script);
    });
  }

  showToaster(msg) {
    if (msg.sound == null || msg.sound == undefined) {
      msg.sound = "../../../assets/audio/alarm-beeps.mp3";
    }
    var soundTimeout = 3000;
    /*message will look like
     * alert:true.
     * message : "some text",
     * scriptName : "some name",
     * eventName : " event to fire on dismiss",
     * type :"success/warning/info...etc"
     */
    const alarm = setInterval(() => {
      this.toastrPlaySound(msg.sound);
    }, soundTimeout);

    switch (msg.type) {
      case "success":
        this.toastr
          .success(msg.message, msg.scriptName)
          .onTap.subscribe(toastClicked => {
            this.sendEvent(msg.scriptName, msg.eventName, "0:0:0");
            clearInterval(alarm);
          });
        break;
      case "warning":
        this.toastr
          .warning(msg.message, msg.scriptName)
          .onTap.subscribe(toastClicked => {
            this.sendEvent(msg.scriptName, msg.eventName, "0:0:0");
            clearInterval(alarm);
          });
        break;
      case "info":
        this.toastr
          .info(msg.message, msg.scriptName)
          .onTap.subscribe(toastClicked => {
            this.sendEvent(msg.scriptName, msg.eventName, "0:0:0");
            clearInterval(alarm);
          });
        break;
      case "danger":
        this.toastr
          .error(msg.message, msg.scriptName)
          .onTap.subscribe(toastClicked => {
            this.sendEvent(msg.scriptName, msg.eventName, "0:0:0");
            clearInterval(alarm);
          });
        break;
      default:
        this.toastr
          .info(msg.message, msg.scriptName)
          .onTap.subscribe(toastClicked => {
            this.sendEvent(msg.scriptName, msg.eventName, "0:0:0");
            clearInterval(alarm);
          });
        break;
    }
  }

  toastrPlaySound(audioSrc) {
    const audio = new Audio();
    audio.src = audioSrc;
    audio.load();
    audio.play();
  }

  setDisplayedHint(scriptName, hintText) {
    for (let i = 0; i < this.scripts.length; i++) {
      const script = this.scripts[i];
      if (script.name == scriptName) {
        script.displayedHint = hintText;
      }
    }
  }

  // ========================================================
  // ============= Node Updates =============================
  // ========================================================

  branchNodeSubscribe() {
    // this.branchNodeSubscription = this.dataService
    //   .branch_ObservableNodeSubscription()
    //   .subscribe((branches: any) => {
    //     this.allBranches = branches;
    //     // this.getEventActionNodeStatus();
    //   });
    console.log("Subscribing to branch node updates");
    this.branchNodeSubscription = this.dataService.branch_ObservableNodeSubscription.subscribe(
      branches => {
        this.allBranches = branches;
        this.getEventActionNodeStatus();
      }
    );
  }

  // Updates the event with the active status of the node
  getEventActionNodeStatus() {
    this.eventNodeUpdates = [];
    if (this.allBranches == undefined || this.allBranches == null) {
      return;
    }
    for (let i = 0; i < this.allBranches.length; i++) {
      let branch = this.allBranches[i];
      if (branch.nodes == undefined) {
        continue;
      }
      for (let j = 0; j < this.scripts.length; j++) {
        let script = this.scripts[j];
        if (script.name == branch.name) {
          /// filter events
          for (let k = 0; k < script.events.length; k++) {
            let evt = script.events[k];
            try {
              for (let i = 0; i < branch.nodes.length; i++) {
                for (let node in branch.nodes[i].meshNodes) {
                  if (branch.nodes[i].meshNodes[`${node}`] != undefined) {
                    let mNode = branch.nodes[i].meshNodes[`${node}`];
                    if (mNode["id"] == evt.device_id) {
                      let eNode = {
                        eventName: evt.name,
                        nodeId: evt.device_id,
                        nodeStatus: ""
                      };
                      let time = new Date().getTime();
                      let nTime = mNode["lastUpdated"];
                      let lastSeen = time - nTime;
                      if (lastSeen < 1000 * 40) {
                        evt.alive = "green";
                        eNode.nodeStatus = "green";
                      } else if (lastSeen > 1000 * 40 && lastSeen < 1000 * 90) {
                        evt.alive = "amber";
                        eNode.nodeStatus = "amber";
                      } else if (lastSeen > 1000 * 90) {
                        evt.alive = "red";
                        eNode.nodeStatus = "red";
                      }
                      this.eventNodeUpdates.push(eNode);
                    }
                  }
                }
              }
            } catch {}
          }
        }
      }
    }
  }
  // ========================================================
  // ============= HINT CONTROLS ============================
  // ========================================================
  sendHint(scriptName) {
    let hintText = $(`#${scriptName}_hintInput`).val();
    const msg = {
      scriptName: scriptName,
      hintText: hintText,
      screenName: "all"
    };
    this.server.hintSendCustomHint(msg).subscribe(result => {
      console.log("Sending hint: ", result);
      // $(`#${scriptName}_hintDisplay`).html(hintText);
      this.setDisplayedHint(scriptName, hintText);
    });
    //Send here
  }

  insertHint(scriptName, hintText) {
    $(`#${scriptName}_hintInput`).val(hintText);
  }

  clearHint(scriptName) {
    $(`#${scriptName}_hintInput`).val("");
    // $(`#${scriptName}_hintDisplay`).html("");
    this.setDisplayedHint(scriptName, "");

    const msg = {
      scriptName: scriptName,
      hintText: "--clear--"
    };
    this.server.clearHint(msg).subscribe(result => {
      console.log("Clearing hint: ", result);
    });
  }

  // ========================================================
  // ============= EVENT CONTROLS ===========================
  // ========================================================
  sendEvent(scriptName, eventName, timeUpdate) {
    console.log("==== Sending event ====", eventName);
    this.server
      .sendForcedEvent(scriptName, eventName, timeUpdate)
      .subscribe(event => {
        console.log(event);
      });
    this.socket.sendForcedEvent(scriptName, eventName);
  }

  // ========================================================
  // ============= ACTION CONTROLS ==========================
  // ========================================================
  sendAction(scriptName, actionName) {
    console.log(actionName);
    this.server.sendForcedAction(scriptName, actionName).subscribe(action => {
      console.log(action);
    });
    this.socket.sendForcedAction(scriptName, actionName);
  }

  // ========================================================
  // ============= TIME CONTROLS ============================
  // ========================================================
  updateTime(scriptName) {
    let hrs, mins, sec;
    let hours = $(`#${scriptName}_inputHours`).val();
    let minutes = $(`#${scriptName}_inputMinutes`).val();
    let seconds = $(`#${scriptName}_inputSeconds`).val();
    if (hours === "") {
      hrs = 0;
    } else {
      hrs = parseInt(hours, 10);
    }
    if (minutes === "") {
      mins = 0;
    } else {
      mins = parseInt(minutes, 10);
    }
    if (seconds === "") {
      sec = 0;
    } else {
      sec = parseInt(seconds, 10);
    }
    this.server.updateCustomTime(scriptName, hrs, mins, sec).subscribe(time => {
      console.log("======= Updated time =======", time);
    });
  }

  pauseGameTimer(scriptName) {
    this.server.pauseGameTimer(scriptName).subscribe(result => {
      console.log(result);
    });
  }

  resumeGameTimer(scriptName) {
    this.server.resumeGameTimer(scriptName).subscribe(result => {
      console.log(result);
    });
  }

  // ========================================================
  // ============= START / END ==============================
  // ========================================================
  startNewInstance(scriptName) {
    this.dataService.overview_getNewScript(scriptName).then(script => {
      let s: any;
      s = script;
      let t = s.time;
      this.sendEvent(scriptName, "start_instance", 0);
      // this.server
      //   .startNewGame(
      //     script,
      //     parseInt(t.hours, 10),
      //     parseInt(t.minutes, 10),
      //     parseInt(t.seconds, 10)
      //   )
      //   .subscribe(status => {
      //     console.log(status);
      //     // this.sendEvent(scriptName, "start_instance", 0);
      //   });
    });
  }

  endInstance(scriptName) {
    this.sendEvent(scriptName, "end_instance", 0);
    this.server.endGame(scriptName).subscribe(result => {
      console.log(result);
    });
  }

  // ========================================================
  // ============= TRIGGERS =================================
  // ========================================================
  sendTrigger(scriptName, trigger) {
    const msg = {
      scriptName: scriptName,
      trigger: trigger,
      screenName: trigger.screenName
    };
    this.server.triggerForceTrigger(msg).subscribe(result => {
      console.log("Forcing trigger: ", msg, result);
    });
  }

  sendAudio(scriptName, audioFile, screenName) {
    const msg = {
      scriptName: scriptName,
      audioFile: audioFile,
      screenName: screenName
    };
    this.server.triggerPlayAudio(msg).subscribe(result => {
      console.log("Playing Audio: ", result);
    });
  }

  triggerPlayVideo(scriptName, videoFile, screenName) {
    const msg = {
      scriptName: scriptName,
      videoFile: videoFile,
      screenName: screenName
    };
    this.server.triggerPlayVideo(msg).subscribe(result => {
      console.log("Playing Video: ", result);
    });
  }

  // ========================================================
  // ============= SLICK SLIDER =============================
  // ========================================================
  slickGoTo(index) {
    this.slickModal.slickGoTo(index);
  }

  shownCards = new Array();

  slickSetCardState(scriptName, state, index = 0) {
    for (var i = 0; i < this.scripts.length; i++) {
      if (this.scripts[i].name === scriptName) {
        this.scripts[i]["ui_show"] = state;
        if (state) {
          this.shownCards.push(this.scripts[i]);
          console.log("pushing", this.scripts[i].name);
          console.log(this.shownCards);
        } else {
          for (let j = 0; j < this.shownCards.length; j++) {
            if (this.shownCards[j].name === scriptName) {
              console.log(this.shownCards);

              this.shownCards.splice(j, 1);
            }
          }
          this.refreshPage();
        }
      }
    }
  }

  refreshPage() {
    this.router
      .navigateByUrl("/settings", { skipLocationChange: true })
      .then(() => {
        this.router.navigate(["/overview"]);
      })
      .then(() => {});
  }

  beforeChange(e) {
    console.log(e);
  }

  toggleSlick() {
    return new Promise((resolve, reject) => {
      this.slickModal.unslick();
    }).then(() => {
      // this.slickModal.initSlick(this.slideConfig);
    });
  }

  // ========================================================
  // ============= MODAL CONTROLLERS \=======================
  // ========================================================
  showActionsModal(scriptName, event) {
    this.modalService.open(this.actionModal, { size: "lg" });
    this.tempScriptName = scriptName;
    this.tempEventToShow = event;
  }

  showTriggersModal(scriptName, triggers) {
    this.modalService.open(this.triggerModal, { size: "lg" });
    this.tempScriptName = scriptName;
    this.tempTriggersToShow = triggers;
  }
  showAudioModal(scriptName, triggers) {
    this.modalService.open(this.audioModal, { size: "lg" });
    this.tempScriptName = scriptName;
    this.tempTriggersToShow = triggers;
  }
  showVideoModal(scriptName, triggers) {
    this.modalService.open(this.videoModal, { size: "lg" });
    this.tempScriptName = scriptName;
    this.tempTriggersToShow = triggers;
  }
}
