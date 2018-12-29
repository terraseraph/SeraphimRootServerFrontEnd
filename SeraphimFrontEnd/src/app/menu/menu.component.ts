import { Component, OnInit } from "@angular/core";
import { RouterModule, Routes, Router } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent implements OnInit {
  constructor(private router: Router, private ngbModule: NgbModule) {}
  model: any = 1;

  ngOnInit() {}

  // Navigate by page name
  navigate(page: string) {
    console.log("navigate", page);
    this.router.navigateByUrl(`/${page}`);
  }
}
