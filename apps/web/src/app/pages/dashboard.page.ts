import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiClient } from '../core/api.client';

@Component({ selector:'p360-dashboard', standalone:true, imports:[CommonModule,MatButtonModule,MatCardModule,MatIconModule,RouterLink], templateUrl:'./dashboard.page.html', styleUrl:'./dashboard.page.scss' })
export class DashboardPageComponent {
  private api=inject(ApiClient); loading=true;
  stats=[{label:'Active orders',value:'03',trend:'+1 this week',icon:'layers',tone:'coral'},{label:'Completed projects',value:'12',trend:'+18% this quarter',icon:'check_circle',tone:'mint'},{label:'Saved topics',value:'08',trend:'2 new matches',icon:'bookmark',tone:'sand'},{label:'Wallet balance',value:'₦24,500',trend:'Available credit',icon:'account_balance_wallet',tone:'blue'}];
  orders:any[]=[{name:'Smart Campus Attendance System',type:'Software design',status:'In review',progress:68,date:'Due 24 Aug',color:'orange'}];
  constructor(){this.api.orderSummary().subscribe({next:items=>{this.orders=items.map(o=>({id:o.id,name:o.project_title||'Project request',type:o.service_type||'Project support',status:o.status.replaceAll('_',' '),progress:o.status==='completed'?100:o.status==='paid'?68:32,date:o.due_date?`Due ${o.due_date}`:'In progress',color:o.status==='completed'?'green':o.status==='paid'?'orange':'blue'})); this.loading=false;},error:()=>this.loading=false});}
}
