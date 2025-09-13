import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { AuthService } from './services/auth.service';
import { TokenStorageService } from './services/token-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Header],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  constructor(
    public authService: AuthService, 
    private tokenStorage: TokenStorageService
  ) {}

  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();  
  }
}