import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoutesRoutingModule } from './routes-routing.module';
import { ConditionComponent } from './condition/condition.component';
import { FormulaComponent } from './formula/formula.component';
import {NgZorroAntdModule, NzDropDownModule, NzPopoverModule, NzSpinModule, NzTreeModule} from "ng-zorro-antd";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [ConditionComponent, FormulaComponent],
  imports: [
    CommonModule,
    RoutesRoutingModule,
    NzSpinModule,
    NzTreeModule,
    NzPopoverModule,
    NzDropDownModule,
    NgZorroAntdModule,
    FormsModule
  ]
})
export class RoutesModule { }
