import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { AddRequirementComponent } from '../add-requirement/add-requirement.component';
import { SearchRequirementComponent } from '../search-requirement/search-requirement.component';
import { ResumeSearchComponent } from '../resume-search/resume-search.component';
import { SkillSetSearchComponent } from '../skill-set-search/skill-set-search.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'add-requirement', component: AddRequirementComponent },
  { path: 'search-requirement', component: SearchRequirementComponent, children: [
    { path: 'skill-set-search', component: SkillSetSearchComponent },
    { path: 'resume-search', component: ResumeSearchComponent },
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export { routes };