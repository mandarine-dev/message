import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conversation } from 'src/core/models/conversation';
import { User } from 'src/core/models/user';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  constructor(private afs: AngularFirestore) { }

  getUserInfos(userId: string): Observable<User> {
    return this.afs.collection<User>('users').doc(userId).get().pipe(
      map(data => new User(data.data()))
    );
  }

  getUsersInConversation(conversationId: string): Observable<User[]> {
    return this.afs.collection('conversations').doc(conversationId).get().pipe(
      map(conversation => {
        const members = conversation.data().members;
        return members.map((memberId: string) => {
          this.afs.collection('users').doc(memberId).get().subscribe(result => {
            const user = result.data();
            return new User(user);
          });
        });
      })
    );
  }

  getConversationsForUser(userId: string): Observable<Conversation[]> {
    return this.afs.collection('conversations', ref => ref.where('memberIds', 'array-contains', userId)).snapshotChanges().pipe(
      map(conversations => {
        const result: Conversation[] = [];
        conversations.map(c => {
          const conversation = c.payload.doc.data() as Conversation;
          conversation.id = c.payload.doc.id;
          conversation.users = [];
          conversation.memberIds.map(member => {
            this.getUserById(member).subscribe(user => {
              conversation.users.push(new User(user));
            });
          });
          result.push(conversation);
        });
        return result;
      })
    );
  }

  createConversation(creatorId: string, members: any[]): Observable<any> {
    return from(this.afs.collection('users').doc(creatorId).collection('conversations').add({
      members: members
    })).pipe(
      map(document => {
        this.afs.collection('conversations').doc(document.id).set({
          members: members
        });
        return document.id;
      })
    );
  }

  getConversationMembersFormatted(members) {
    let result = '';
    members.forEach((member, index) => {
      result += member.name + (index === members.length - 1 ? '' : ', ');
    });
    return result;
  }

  getUserById(userId): Observable<User> {
    return this.afs.collection<User>('users').doc(userId).get().pipe(
      map(data => new User(data.data()))
    );
  }

  getMessages(conversationId): Observable<any> {
    return this.afs.collection(`conversations/${conversationId}/messages`).valueChanges().pipe(
      map(messages => messages)
    );
  }

  setUserIsTyping(conversationId, userId: string) {
    const typersArray = [];
    typersArray.push(userId);
    this.afs.collection(`conversations`).doc(conversationId).set({
      isTyping: typersArray
    }, { merge: true });
  }

  addMessages(conversationId, senderId, message) {
    return from(this.afs.collection(`conversations/${conversationId}/messages`).add({
      text: message,
      senderId: senderId,
      createdAt: new Date()
    }));
  }

  registerDisplayMessage(conversationId, message) {
    this.afs.collection(`conversations`).doc(conversationId).set({
      displayMessage: message
    }, { merge: true });
  }

}
