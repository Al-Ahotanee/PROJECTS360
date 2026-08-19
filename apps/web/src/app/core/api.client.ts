import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ProjectTopic { id:string; title:string; department:string; level:string; price:number; short_description:string; introduction?:string; aim_objectives?:string; scope_limitations?:string; methodology?:string; icon:string; accent:string; files?:Array<{id:string;file_name:string;file_type:string;file_url:string}>; }
export interface FaqItem { id:string; question:string; answer:string; category:string; }
export interface Session { access_token:string; user:{id:string;email:string;full_name:string;role:string}; }
export interface Order { id:string; project_title?:string; service_type?:string; status:string; payment_status:string; amount:number; brief?:string; due_date?:string; created_at:string; updated_at?:string; }

@Injectable({providedIn:'root'})
export class ApiClient {
  private http=inject(HttpClient); private base='/api';
  projects(search='',department='') { return this.http.get<ProjectTopic[]>(`${this.base}/projects`,{params:{search,department}}); }
  project(id:string) { return this.http.get<ProjectTopic>(`${this.base}/projects/${id}`); }
  featuredProjects() { return this.http.get<ProjectTopic[]>(`${this.base}/projects/featured`); }
  faqs() { return this.http.get<FaqItem[]>(`${this.base}/faqs`); }
  login(email:string,password:string) { return this.http.post<Session>(`${this.base}/auth/login`,{email,password}); }
  signup(full_name:string,email:string,password:string) { return this.http.post<Session>(`${this.base}/auth/signup`,{full_name,email,password}); }
  me() { return this.http.get<Record<string,unknown>>(`${this.base}/auth/me`); }
  orderSummary() { return this.http.get<Order[]>(`${this.base}/orders/summary`); }
  createOrder(topic_id:string,brief:string) { return this.http.post<Order>(`${this.base}/orders`,{topic_id,brief}); }
  order(id:string) { return this.http.get<Order & {events:any[];files:any[];review:any;brief:any}>(`${this.base}/orders/${id}`); }
  saveBrief(id:string,brief:Record<string,unknown>) { return this.http.put(`${this.base}/orders/${id}/brief`,brief); }
  payOrder(id:string) { return this.http.post(`${this.base}/orders/${id}/pay`,{}); }
  cancelOrder(id:string) { return this.http.post(`${this.base}/orders/${id}/cancel`,{}); }
  reviewOrder(id:string,rating:number,comment:string) { return this.http.post(`${this.base}/orders/${id}/review`,{rating,comment}); }
  profile() { return this.http.get<Record<string,unknown>>(`${this.base}/profile`); }
  updateProfile(payload:Record<string,unknown>) { return this.http.patch(`${this.base}/profile`,payload); }
  services() { return this.http.get<any[]>(`${this.base}/services`); }
  createService(payload:Record<string,unknown>) { return this.http.post(`${this.base}/services`,payload); }
  orderFiles(orderId:string) { return this.http.get<any[]>(`${this.base}/files/order/${orderId}`); }
  addFile(payload:Record<string,unknown>) { return this.http.post(`${this.base}/files`,payload); }
  referrals() { return this.http.get<any[]>(`${this.base}/referrals`); }
  createReferral(referred_email:string) { return this.http.post(`${this.base}/referrals`,{referred_email}); }
  applyAmbassador(payload:Record<string,unknown>) { return this.http.post(`${this.base}/ambassador/apply`,payload); }
  myAmbassadorApplications() { return this.http.get<any[]>(`${this.base}/ambassador/mine`); }
  notifications() { return this.http.get<any[]>(`${this.base}/notifications`); }
  markNotificationRead(id:string) { return this.http.post(`${this.base}/notifications/${id}/read`,{}); }
  adminOrders() { return this.http.get<any[]>(`${this.base}/admin/orders`); }
  adminUsers() { return this.http.get<any[]>(`${this.base}/admin/users`); }
  adminUpdateOrder(id:string,status:string) { return this.http.patch(`${this.base}/admin/orders/${id}/status`,{status}); }
}
