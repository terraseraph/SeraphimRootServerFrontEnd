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
        // for (let i = 0; i < this.branchList.length; i++) {
        //   const branch = branchList[i];
        //   this.dataService.branch_getAllBranchNodes(branch.id);
        // }
      }
    );
  }
  branchSubscribe() {
    this.branchSubscription = this.dataService.branch_observableSelectedBranch.subscribe(
      branch => {
        this.selectedBranch = branch;
        console.log("selected branch for editing: ", branch);
        this.branchLoaded = true;
      }
    );
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
}
