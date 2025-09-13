import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MyPlansService } from '../../services/my-plans.service';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-my-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-plans.component.html',
  styleUrls: ['./my-plans.component.css']
})
export class MyPlansComponent implements OnInit {

  plans: any[] = [];
  private userEmail!: string;
  error: string | null = null;

  constructor(private myPlansService: MyPlansService, private authService: AuthService) { }

  ngOnInit(): void {
    console.log('MyPlansComponent ngOnInit called');
        this.authService.currentUser$.subscribe((user: User | null) => {
      if (user && user.email) {
        this.userEmail = user.email;
      }
    });
    this.loadPlans();
  }

  loadPlans(): void {
    console.log('Loading plans...');
    this.myPlansService.getMyPlans().subscribe(
      (data) => {
        console.log('Raw data from API:', data);
        this.plans = data.plans;
        this.error = null;
      },
      (error) => {
        console.error('Full error object:', JSON.stringify(error, null, 2));
        this.error = 'Error fetching plans. Check console for details.';
      }
    );
  }

  cancelPlan(planId: string): void {
    this.myPlansService.cancelPlan(planId).subscribe({
      next: () => {
        this.loadPlans();
      },
      error: (err) => {
        console.error('Error canceling plan:', err);
      }
    });
  }

}