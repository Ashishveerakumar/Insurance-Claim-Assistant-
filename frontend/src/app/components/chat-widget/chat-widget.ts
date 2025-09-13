import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { createChat } from '@n8n/chat';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  template: '<div id="n8n-chat-container"></div>',
  styleUrls: ['./chat-widget.css'],
})
export class ChatWidget implements OnInit, OnDestroy {
  @Input() webhookUrl!: string;

  private chat: any;

  async ngOnInit() {
    this.chat = await createChat({
      webhookUrl: 'http://localhost:5678/webhook/20561647-3a0c-4dab-940a-bc14a6ec4fb4/chat',
      target: '#n8n-chat-container',
      mode: 'fullscreen',
    });
  }

  ngOnDestroy() {
    if (this.chat && typeof this.chat.destroy === 'function') {
      this.chat.destroy();
    }
  }
}