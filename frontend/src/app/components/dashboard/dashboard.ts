import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  // Plans list
  plans = [
    { id: 1, name: 'Health Insurance', file: 'health_insurance.pdf' },
    { id: 2, name: 'Life Insurance', file: 'life_insurance.pdf' },
    { id: 3, name: 'Car Insurance', file: 'car_insurance.pdf' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

  }


  viewPlan(planId: number) {
  this.router.navigate(['/plan', planId]);
}


}
