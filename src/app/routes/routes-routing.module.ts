import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ConditionComponent} from "./condition/condition.component";
import {FormulaComponent} from "./formula/formula.component";


const routes: Routes = [
  {path: '', component: ConditionComponent,},
  {path: 'condition', component: ConditionComponent, data: {title: '条件'}},
  {path: 'formula', component: FormulaComponent, data: {title: '公式'}},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoutesRoutingModule {
}
