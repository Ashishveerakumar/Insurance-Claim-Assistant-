import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChatWidget } from '../chat-widget/chat-widget';

@Component({
  selector: 'app-plan-details',
  templateUrl: './plan-details.html',
  styleUrls: ['./plan-details.css'],
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, FormsModule, HttpClientModule, ChatWidget]
})
export class PlanDetails implements OnInit {
  pdfUrl: string = '';
  planId: number | null = null;
  showChat: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.showChat = true;
    this.planId = Number(this.route.snapshot.paramMap.get('id'));
    const planId = this.planId;

    if (planId === 1) {
      this.pdfUrl = 'assets/plans/health_insurance.pdf';
    } else if (planId === 2) {
      this.pdfUrl = 'assets/plans/life_insurance.pdf';
    } else if (planId === 3) {
      this.pdfUrl = 'assets/plans/car_insurance.pdf';
    }
  }

  ngOnDestroy(): void {
    this.showChat = false;
  }

  applyPlan() {
    this.router.navigate(['/life-insurance', this.planId]);
  }
}


