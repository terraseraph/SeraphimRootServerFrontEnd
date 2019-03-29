import { Component, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../data.service";
import { Subscription } from "rxjs";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from "@angular/forms";
import * as $ from "jquery";
import { load } from "@angular/core/src/render3";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {
  branchSubscription: Subscription;
  branchListSubscription: Subscription;
  selectedBranch: any;
  branchList: any;
  branchLoaded: boolean;

  // Editing nodes
  nodeTypes = [
    "relay",
    "bridge",
    "button",
    "keypad",
    "magSwitch",
    "rfid",
    "mp3"
  ];
  tempNodeType: any;

  tempAction: any;
  tempActionType: any;
  tempActionData: any;

  tempShellCommand: any;

  // New Branch
  @ViewChild("newBranchModal") newBranchModal: any;
  newBranchName: any;
  newBranchIp: any;

  //Selected branch
  @ViewChild("branchConfigModal") branchConfigModal: any;
  selectedBridgeToEdit: any;
  selectedBranchMeshNodes = [];
  meshNodeToEdit: any;

  // Action packets
  actionRelayData = [15, 2, 4, 5, 27, 14, 12, 13];
  actionRelayActions = ["start", "stop", "toggleA"];
  actionRelayActionType = "relay";

  // Branch Media
  selectedFile: any;
  selectedVideoName: any;
  selectedAudioName: any;
  selectedFilePath: any;
  mediaType: any;

  // branch scripts
  allScripts: any;
  selectedScriptToUpload: any;

  constructor(
    public dataService: DataService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.branchListSubscribe();
    this.branchSubscribe();
    this.branchLoaded = false;
  }

  onFileSelected(event) {
    event.preventDefault();
    console.log(event);
    this.selectedFile = event.target.files[0];
    this.selectedFilePath = event.target.files[0].path;
  }

  updateMedia() {
    // event.preventDefault();
    this.prepareForm().then(fd => {
      if (this.mediaType == "video") {
        this.dataService.branch_uploadVideo(fd, result => {
          this.loadBranch(this.selectedBranch.id);
        });
      } else if (this.mediaType == "audio") {
        this.dataService.branch_uploadAudio(fd, result => {
          this.loadBranch(this.selectedBranch.id);
        });
      }
      this.mediaType = "none";
    });
  }

  prepareForm() {
    return new Promise((resolve, reject) => {
      let fd: FormData = new FormData();
      fd.append("file", this.selectedFile, this.selectedFile.name);
      fd.append("branchIp", this.selectedBranch.ip_address);
      console.log(this.selectedFile, this.selectedFile.name);
      resolve(fd);
    });
  }

  setMediaType(type) {
    this.mediaType = type;
    if (type == "video") {
      this.selectedVideoName = this.selectedFile.name;
    } else if (type == "audio") {
      this.selectedAudioName = this.selectedFile.name;
    }
  }

  branchListSubscribe() {
    this.dataService.branch_getScriptsForUploading(scripts => {
      this.allScripts = scripts;
    });

    this.dataService.branch_serverGetAllBranches();
    this.branchListSubscription = this.dataService.branch_observableBranchList.subscribe(
      branchList => {
        console.log(branchList);
        this.branchList = branchList;
        if (branchList === undefined) {
          return;
        }
      }
    );
  }
  branchSubscribe() {
    this.branchSubscription = this.dataService.branch_observableSelectedBranch.subscribe(
      branch => {
        if (branch != undefined) {
          console.log("GOT BRANCH");
          if (branch.nodes != undefined) {
            console.log("GOT NODE");
            for (let i = 0; i < branch.nodes.length; i++) {
              let node = branch.nodes[i];
              this.makeArr(node.meshNodes).then(arr => {});
            }
          }
        }
        this.selectedBranch = branch;
        console.log("selected branch for editing: ", branch);
        this.branchLoaded = true;
      }
    );
  }

  makeArr(meshNodes) {
    return new Promise((resolve, reject) => {
      this.selectedBranchMeshNodes = [];
      var nodes = [];
      for (var x in meshNodes) {
        console.log("pushing", x);
        this.selectedBranchMeshNodes.push(meshNodes[x]);
        nodes.push(meshNodes[x]);
      }
      resolve(nodes);
    });
  }

  loadBranch(id) {
    this.dataService.branch_setSelectedBranch(id);
    this.dataService.branch_getAllBranchNodes(id);
    // this is now read as selectedBranch
    this.branchLoaded = true;
  }

  deleteBranch(id) {
    this.dataService.branch_deleteBranch(id);
  }

  configBranch(id) {
    this.loadBranch(id);
    this.modalService.open(this.branchConfigModal, { size: "lg" });
  }

  updateBRanchConfig() {
    this.dataService.branch_updateSelectedBranch(this.selectedBranch);
  }

  showNewBranchNameModal() {
    this.modalService.open(this.newBranchModal, { size: "lg" });
    this.newBranchName = "";
    this.newBranchIp = "";
  }

  createNewBranch() {
    this.dataService.branch_createNewBranch(
      this.newBranchName,
      this.newBranchIp
    );
    this.dataService.branch_serverGetAllBranches();
  }

  branchDeleteVideo(name) {
    this.dataService.branch_deleteVideo(
      name,
      this.selectedBranch.ip_address,
      result => {
        this.loadBranch(this.selectedBranch.id);
      }
    );
  }

  branchDeleteAudio(name) {
    this.dataService.branch_deleteAudio(
      name,
      this.selectedBranch.ip_address,
      result => {
        this.loadBranch(this.selectedBranch.id);
      }
    );
  }

  branchDeleteScript(scriptName: any) {
    this.dataService.branch_deleteScript(
      scriptName,
      this.selectedBranch.ip_address
    );
  }

  branchAddScript(script) {
    this.dataService.branch_uploadScript(
      script,
      this.selectedBranch.ip_address
    );
  }

  // =============================
  // ===== QUERY NODE FUNCTIONS ==
  // =============================
  getNodeSubconnections(bridgeId) {}

  getNodeNodeList(bridgeId) {
    //type = getMeshNodes
  }

  // =============================
  // ====== EDIT NODE FUNCTIONS ==
  // =============================
  editNodeBranchAddress(bridgeId, ipaddress) {
    //ip address as int array i.e. [192,168,0,10]
  }

  editNodeId(bridgeId, bridgeType, nodeId) {
    // let newId = $(`#mNodeId_${nodeId}`).val();
    this.getElemValue(`#mNodeId_${nodeId}`).then(newId => {
      let node = {
        branchAddress: this.selectedBranch.ip_address,
        bridgeId: bridgeId,
        bridgeType: bridgeType,
        nodeId: nodeId,
        newId: newId
      };
      console.log(node);
      this.dataService.branch_editNodeCommonId(node);
    });
  }

  editNodeType(bridgeId, bridgeType, nodeId) {
    let newType = $(`#mNodeSelectType_${nodeId} option:selected`).text();
    let node = {
      branchAddress: this.selectedBranch.ip_address,
      bridgeId: bridgeId,
      bridgeType: bridgeType,
      nodeId: nodeId,
      newType: newType
    };
    this.dataService.branch_editNodeType(node);
  }

  getElemValue(elemId) {
    return new Promise((resolve, reject) => {
      let result = $(elemId).val();
      resolve(result);
      // while (result == "" || result == undefined) {
      //   result = $(elemId).val();
      //   if (result != "" && result != undefined) {
      //     resolve(result);
      //     return;
      //   }
      // }
    });
  }

  sendActionToNode(bridgeId, bridgeType, nodeId, action, actionType, data) {
    let node = {
      branchAddress: this.selectedBranch.ip_address,
      bridgeId: bridgeId,
      bridgeType: bridgeType,
      nodeId: nodeId,
      action: action,
      actionType: actionType,
      data: data
    };
    this.dataService.branch_sendNodeAction(node);
  }

  getMeshNodeToEdit(hardwareId, cb) {
    for (let i = 0; i < this.selectedBranchMeshNodes.length; i++) {
      const node = this.selectedBranchMeshNodes[i];
      if (node.hardwareId === hardwareId) {
        cb(node);
      }
    }
  }

  // =============================
  // ===== SHELL FUNCTIONS =======
  // =============================

  shellRestartBranch() {
    this.dataService.branch_shellRestartBranch(this.selectedBranch.ip_address);
  }

  shellReloadBranchScreen() {
    this.dataService.branch_shellReloadBranchScreen(
      this.selectedBranch.ip_address
    );
  }

  shellCustomCommand() {
    this.dataService.branch_shellCustomCommand(
      this.selectedBranch.ip_address,
      this.tempShellCommand
    );
  }

  shellUpdateFromGit() {
    this.dataService.branch_shellUpdateFromGit(this.selectedBranch.ip_address);
  }
}
