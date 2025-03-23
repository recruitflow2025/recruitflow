import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { AddRequirementComponent } from '../add-requirement/add-requirement.component';
import { SearchRequirementComponent } from '../search-requirement/search-requirement.component';
import { ResumeSearchComponent } from '../resume-search/resume-search.component';
import { SkillSetSearchComponent } from '../skill-set-search/skill-set-search.component';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { authGuard, loginGuard } from '../common/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'add-requirement', component: AddRequirementComponent },
      { 
        path: 'search-requirement', 
        component: SearchRequirementComponent, 
        children: [
          { path: '', redirectTo: 'skill-set-search', pathMatch: 'full' },
          { path: 'skill-set-search', component: SkillSetSearchComponent },
          { path: 'resume-search', component: ResumeSearchComponent },
        ]
      },
    ]
  },
  // Catch-all redirect to login
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export { routes };