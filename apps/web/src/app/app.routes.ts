import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard.page';
import { CatalogPageComponent } from './pages/catalog.page';
import { FaqPageComponent, LoginPageComponent, LandingPageComponent } from './pages/misc.pages';
import { ProjectDetailPageComponent, OrderDetailPageComponent, ServicesWorkflowPageComponent, ProfileWorkflowPageComponent, AmbassadorPageComponent, NotificationsPageComponent, OrdersWorkflowPageComponent } from './pages/workflow.pages';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'catalog', component: CatalogPageComponent },
  { path: 'projects/:id', component: ProjectDetailPageComponent },
  { path: 'services', component: ServicesWorkflowPageComponent },
  { path: 'orders', component: OrdersWorkflowPageComponent },
  { path: 'orders/:id', component: OrderDetailPageComponent },
  { path: 'profile', component: ProfileWorkflowPageComponent },
  { path: 'ambassador', component: AmbassadorPageComponent },
  { path: 'notifications', component: NotificationsPageComponent },
  { path: 'faq', component: FaqPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: '**', redirectTo: 'dashboard' }
];
