import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import * as showdown from 'showdown';

interface Message {
  text?: string;
  imageUrl?: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent implements AfterViewInit, OnInit {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  messages: Message[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  webhookUrl: string = 'http://localhost:5678/webhook/0470f67d-8c08-4752-b1c9-af6bf7c191d1';
  selectedFiles: File[] = [];
  imagePreviewUrls: (string | ArrayBuffer)[] = [];
  sessionId: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.sessionId = this.generateSessionId();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (this.newMessage.trim() === '' && this.selectedFiles.length === 0) return;

    const userMessage: Message = {
      isUser: true,
      text: this.newMessage.trim() || undefined
    };
    if (this.imagePreviewUrls.length > 0) {
      // For simplicity, we can add a text message and then show images separately
      // or handle multiple images in one message bubble if the UI supports it.
      // Here, we'll just use the first image for the main message block for now
      // and assume the UI will show all previews.
      userMessage.imageUrl = this.imagePreviewUrls[0] as string;
    }
    this.messages.push(userMessage);
    this.isLoading = true;
    this.scrollToBottom();

    const formData = new FormData();
    this.selectedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });
    formData.append('message', this.newMessage);
    formData.append('sessionId', this.sessionId);

    this.http.post<any>(this.webhookUrl, formData)
      .subscribe({
        next: (response) => {
          console.log('Webhook response:', response);
          this.isLoading = false;
          if (response && response.output) {
            const botMessage: Message = {
              text: response.output,
              isUser: false,
              imageUrl: response.imageUrl
            };
            this.messages.push(botMessage);
          } else {
            this.messages.push({ text: 'Sorry, I am having trouble understanding you.', isUser: false });
          }
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error sending message to webhook:', error);
          this.isLoading = false;
          this.messages.push({ text: 'Sorry, there was an error. Please try again later.', isUser: false });
          this.scrollToBottom();
        }
      });

    this.newMessage = '';
    this.selectedFiles = [];
    this.imagePreviewUrls = [];
  }

  convertMarkdownToHtml(markdown: string): string {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdown);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }, 0);
    } catch (err) {
      console.error('Could not scroll to bottom:', err);
    }
  }
}
