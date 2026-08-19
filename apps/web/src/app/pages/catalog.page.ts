import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { ApiClient, ProjectTopic } from '../core/api.client';

@Component({ selector:'p360-catalog', standalone:true, imports:[CommonModule,FormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatIconModule,MatInputModule,MatChipsModule], templateUrl:'./catalog.page.html', styleUrl:'./catalog.page.scss' })
export class CatalogPageComponent {
  private api=inject(ApiClient); search=signal(''); selected=signal('All'); loading=signal(true); error=signal('');
  filters=['All','Computer Science','Business','Engineering','Health Sciences'];
  topics=signal<any[]>([
    {title:'Smart Campus Attendance System',department:'Computer Science',level:'Intermediate',price:28000,short_description:'A practical system for secure attendance capture, reporting, and student analytics.',icon:'qr_code_scanner',accent:'coral'},
    {title:'AI-Based Timetable Scheduling',department:'Artificial Intelligence',level:'Advanced',price:32000,short_description:'Generate optimized academic timetables using genetic algorithms and constraints.',icon:'calendar_month',accent:'blue'},
    {title:'E-commerce Inventory Platform',department:'Software Engineering',level:'Intermediate',price:26500,short_description:'Build a resilient inventory and order management workflow for growing sellers.',icon:'inventory_2',accent:'mint'},
    {title:'Hospital Appointment Portal',department:'Health Informatics',level:'Intermediate',price:24000,short_description:'Design an accessible portal that connects patients, doctors, and records.',icon:'local_hospital',accent:'sand'},
    {title:'Microfinance Credit Scoring Model',department:'Data Science',level:'Advanced',price:35000,short_description:'Explore interpretable scoring models for responsible lending decisions.',icon:'query_stats',accent:'violet'},
    {title:'Smart Irrigation Monitor',department:'Electrical Engineering',level:'Advanced',price:31000,short_description:'A sensor-led IoT project for measuring and responding to soil conditions.',icon:'water_drop',accent:'teal'}
  ]);
  results=computed(()=>this.topics().filter(t=>(this.selected()==='All'||t.department.includes(this.selected())||(this.selected()==='Computer Science'&&t.department==='Artificial Intelligence')||(this.selected()==='Engineering'&&t.department.includes('Engineering')))&&t.title.toLowerCase().includes(this.search().toLowerCase())));
  constructor(){this.api.projects().subscribe({next:r=>{this.topics.set(r);this.loading.set(false);},error:()=>{this.loading.set(false);this.error.set('Showing the curated library while the API is offline.');}});}
}
