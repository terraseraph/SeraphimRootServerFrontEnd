import { Component, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../data.service";
import { Subscription } from "rxjs";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
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

  // New Branch
  @ViewChild("newBranchModal") newBranchModal: any;
  newBranchName: any;
  newBranchIp: any;

  //Selected branch
  @ViewChild("branchConfigModal") branchConfigModal: any;
  selectedBridgeToEdit: any;
  selectedBranchMeshNodes = [];
  meshNodeToEdit: any;

  constructor(
    public dataService: DataService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.branchListSubscribe();
    this.branchSubscribe();
    this.branchLoaded = false;
  }

  branchListSubscribe() {
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

  editNodeId(bridgeId, hwId, toId) {
    //type = setId
  }

  editNodeType(bridgeId, hwId, toType) {
    //type = functionChange
    // msg == "bridge" ||
    //   msg == "button" ||
    //   msg == "keypad" ||
    //   msg == "relay" ||
    //   msg == "reedSwitch" ||
    //   msg == "magSwitch" ||
    //   msg == "rfid" ||
    //   msg == "button")
  }

  getMeshNodeToEdit(hardwareId, cb) {
    for (let i = 0; i < this.selectedBranchMeshNodes.length; i++) {
      const node = this.selectedBranchMeshNodes[i];
      if (node.hardwareId === hardwareId) {
        cb(node);
      }
    }
  }
}
