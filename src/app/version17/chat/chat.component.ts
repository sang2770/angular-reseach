import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeminiChatService } from './chat.service';
import { ChatGroup, ChatMessage } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatWindow') private chatWindow!: ElementRef;

  chatForm: FormGroup;
  chatGroups: ChatGroup[] = [];
  currentMessages: ChatMessage[] = [];
  isTyping: boolean = false;
  showScrollToBottom: boolean = false;
  showScrollToTop: boolean = false;
  selectedGroupId: string | null = null;
  showChatPanel: boolean = true;
  private recognition: any;
  isListening: boolean = false;
  autoRead: boolean = false;

  constructor(
    private fb: FormBuilder,
    public chatService: GeminiChatService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.chatService.getChatGroups().subscribe(groups => {
      this.chatGroups = groups;
    });

    this.chatService.getCurrentMessages().subscribe(messages => {
      this.currentMessages = messages;
      this.scrollToBottom();
      if (this.autoRead && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'ai') {
          this.readMessage(lastMessage);
        }
      }
    });
    this.initSpeechRecognition();
  }

  toggleChatPanel() {
    this.showChatPanel = !this.showChatPanel;
  }

  createNewChatGroup() {
    const name = prompt('Enter a name for the new chat:');
    if (name) {
      const newGroupId = this.chatService.createNewChatGroup(name);
      this.selectChatGroup(newGroupId);
    }
  }

  selectChatGroup(groupId: string) {
    this.selectedGroupId = groupId;
    this.chatService.selectChatGroup(groupId);
  }

  sendMessage() {
    if (this.chatForm.valid && this.selectedGroupId) {
      const message = this.chatForm.get('message')?.value;
      this.chatService.sendMessage(message);
      this.chatForm.reset();
    }
  }

  initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.ngZone.run(() => {
          this.chatForm.patchValue({ message: transcript });
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.ngZone.run(() => {
          this.isListening = false;
        });
      };
    } else {
      console.error('Web Speech API is not supported in this browser.');
    }
  }

  toggleVoiceInput() {
    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
    this.isListening = !this.isListening;
  }

  formatMessage(text: string): string {
    // Convert ** to <strong> tags
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert * to <li> tags within <ul> tags
    text = text.replace(/\n\*(.*)/g, '<li>$1</li>');
    text = text.replace(/<li>.*?<\/li>/g, match => `<ul>${match}</ul>`);

    // Convert URLs to clickable links
    text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    // Convert newlines to <br> tags
    text = text.replace(/\n/g, '<br>');

    return text;
  }

  ngAfterViewChecked() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => this.checkScroll(), 0);
    });
  }

  checkScroll() {
    this.ngZone.runOutsideAngular(() => {
      const element = this.chatWindow.nativeElement;
      const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 1;
      const atTop = element.scrollTop === 0;

      if (this.showScrollToBottom !== !atBottom || this.showScrollToTop !== !atTop) {
        this.ngZone.run(() => {
          this.showScrollToBottom = !atBottom;
          this.showScrollToTop = !atTop;
          this.cdr.detectChanges();
        });
      }
    });
  }

  scrollToBottom() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.chatWindow && this.chatWindow.nativeElement) {
          this.chatWindow.nativeElement.scrollTop = this.chatWindow.nativeElement.scrollHeight;
          this.checkScroll();
        }
      }, 0);
    });
  }

  scrollToTop() {
    this.ngZone.runOutsideAngular(() => {
      if (this.chatWindow && this.chatWindow.nativeElement) {
        this.chatWindow.nativeElement.scrollTop = 0;
        setTimeout(() => this.checkScroll(), 100);
      }
    });
  }

  onScroll() {
    this.ngZone.runOutsideAngular(() => {
      this.checkScroll();
    });
  }

  readMessage(message: ChatMessage) {
    this.chatService.readMessageAloud(message.text);
  }

  stopReading() {
    this.chatService.stopReading();
  }
}
