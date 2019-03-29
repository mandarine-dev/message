import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { orderBy } from 'lodash';
import { MarkdownService } from 'ngx-markdown';
import { Message } from 'src/core/models/message';
import { ConversationService } from '../conversation.service';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { User } from 'src/core/models/user';
import { Conversation } from 'src/core/models/conversation';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  // @ViewChild('sendButton') sendButton: Button;
  @ViewChild('chat') private myScrollContainer: ElementRef;

  members = [];
  message = '';
  img = 'https://pbs.twimg.com/profile_images/1034412801341710336/Hr_el9Ra.jpg';
  messages: Message[];

  previousSenderId;
  isInterlocutorWritting = true;
  conversationId;
  isLoading: boolean;
  user: User;
  conversation: Conversation;

  itemExpandWidth = 80;
  isExpanded = true;

  constructor(
    private route: ActivatedRoute,
    private conversationSvc: ConversationService,
    private markdownService: MarkdownService,
    private menu: MenuController,
    private authSvc: AuthenticationService
  ) { }

  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('uid');
    if (this.conversationId) {
      this.authSvc.user$.subscribe(user => {
        this.user = user;
        this.load();
      });
    }
    document.querySelector('ion-tab-bar').style.display = 'none';
  }

  load(): any {
    this.isLoading = true;
    this.conversationSvc.getConversation(this.conversationId).subscribe(conversation => {
      console.log('conversation', conversation);
    });
    this.conversationSvc.getMessages(this.conversationId).subscribe(messages => {
      this.messages = orderBy(messages, ['createdAt'], ['asc']);
      this.isLoading = false;
      this.scrollToBottom();
    });
  }

  sendMessage() {
    this.scrollToBottom();
    if (this.message !== '') {
      this.conversationSvc.addMessages(this.conversationId, this.user.uid, this.message).subscribe(() => {
        this.conversationSvc.registerDisplayMessage(this.conversationId, this.markdownService.compile(this.message));
        this.message = '';
        this.conversationSvc.unsetUserTyping(this.conversationId, this.user.uid);
      });
    }
  }

  getConversationInterlocutors() {
    let result = '';
    if (this.members) {
      // console.log('this.members', this.members);
      this.members.forEach(interlocutor => {
        result += interlocutor.name + (this.members.length > 1 ? ', ' : '');
      });
    }
    return result;
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight + 600;
      }, 300);
    } catch (err) {
      console.log('err:', err);
    }
  }

  emitUserTyping(): void {
    this.conversationSvc.setUserIsTyping(this.conversationId, this.user.uid);
  }

  registerDisplayMessage() {

  }

  getClasses(senderId: string) {
    const endGroup = senderId !== this.previousSenderId;
    this.previousSenderId = senderId;
    return {
      incoming: this.user.uid !== senderId,
      outgoing: this.user.uid === senderId,
      grouped: endGroup
    };
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

  openCollapside() {
    this.isExpanded = true;
  }

  closeCollapside() {
    this.isExpanded = false;
  }

  sendPictures(e) {
    this.scrollToBottom();
    this.conversationSvc.sendPicture(this.conversationId, this.user.uid, e).subscribe(() => {
      this.conversationSvc.registerDisplayMessage(this.conversationId, '(Picture)');
      this.message = '';
      this.conversationSvc.unsetUserTyping(this.conversationId, this.user.uid);
    });
  }


}
