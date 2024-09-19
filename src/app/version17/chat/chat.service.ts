import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";

export abstract class ChatService {
    abstract getChatGroups(): Observable<ChatGroup[]>;
    abstract getCurrentMessages(): Observable<ChatMessage[]>;
    abstract createNewChatGroup(name: string): string;
    abstract selectChatGroup(groupId: string): void;
}
export interface ChatMessage {
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }
  
  export interface ChatGroup {
    id: string;
    name: string;
    lastMessage: string;
    messages: ChatMessage[];
  }
@Injectable({
    providedIn: 'root'
})
export class GeminiChatService implements ChatService {
    private chatGroups: ChatGroup[] = [];
    private currentGroupId: string | null = null;
    private chatGroupsSubject = new BehaviorSubject<ChatGroup[]>([]);
    private currentMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private chatSessions: Map<string, ChatSession> = new Map();
    public speechSynthesis: SpeechSynthesis;
    private speechUtterance: SpeechSynthesisUtterance;

    constructor() {
        this.genAI = new GoogleGenerativeAI('AIzaSyCED9u5LKzyn2CCa3wh-huNR_mchMJoyo8');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.loadChatGroups();
        this.speechSynthesis = window.speechSynthesis;
        this.speechUtterance = new SpeechSynthesisUtterance();
    }

    private loadChatGroups() {
        const savedGroups = localStorage.getItem('chatGroups');
        if (savedGroups) {
            this.chatGroups = JSON.parse(savedGroups);
            this.chatGroupsSubject.next(this.chatGroups);
            // Initialize chat sessions for existing groups
            this.chatGroups.forEach(group => {
                this.initChatSession(group.id);
            });
        }
    }

    private saveChatGroups() {
        localStorage.setItem('chatGroups', JSON.stringify(this.chatGroups));
        this.chatGroupsSubject.next(this.chatGroups);
    }

    private initChatSession(groupId: string) {
        if (!this.chatSessions.has(groupId)) {
            this.chatSessions.set(groupId, this.model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            }));
        }
    }

    getChatGroups(): Observable<ChatGroup[]> {
        return this.chatGroupsSubject.asObservable();
    }

    getCurrentMessages(): Observable<ChatMessage[]> {
        return this.currentMessagesSubject.asObservable();
    }

    createNewChatGroup(name: string): string {
        const newGroup: ChatGroup = {
            id: Date.now().toString(),
            name,
            lastMessage: '',
            messages: []
        };
        this.chatGroups.push(newGroup);
        this.initChatSession(newGroup.id);
        this.saveChatGroups();
        return newGroup.id;
    }

    selectChatGroup(groupId: string) {
        this.currentGroupId = groupId;
        const group = this.chatGroups.find(g => g.id === groupId);
        if (group) {
            this.currentMessagesSubject.next(group.messages);
        }
    }

    async sendMessage(message: string) {
        if (!this.currentGroupId) return;

        const newMessage: ChatMessage = {
            text: message,
            sender: 'user',
            timestamp: new Date()
        };

        const group = this.chatGroups.find(g => g.id === this.currentGroupId);
        if (group) {
            group.messages.push(newMessage);
            group.lastMessage = message;
            this.currentMessagesSubject.next(group.messages);
            this.saveChatGroups();

            // Generate AI response using the chat session
            try {
                const chatSession = this.chatSessions.get(this.currentGroupId);
                if (chatSession) {
                    const result = await chatSession.sendMessage(message);
                    const aiMessage: ChatMessage = {
                        text: result.response.text(),
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    group.messages.push(aiMessage);
                    group.lastMessage = aiMessage.text;
                    this.currentMessagesSubject.next(group.messages);
                    this.saveChatGroups();
                }
            } catch (error) {
                console.error('Error generating AI response:', error);
            }
        }
    }

    readMessageAloud(message: string) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.speechUtterance.text = message;
        this.speechSynthesis.speak(this.speechUtterance);
    }

    stopReading() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
    }
}

