import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable, of } from 'rxjs';
import { User } from 'src/core/models/user';

declare var cordova: any;

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  phoneNumber: string;
  connecting = false;
  verificationID: string;
  user$: Observable<User>;
  /*Init user object*/
  userObj: User = { uid: 'init', name: 'init', phoneNumber: 'init' };

  constructor(private router: Router, private afs: AngularFirestore) {
    const that = this;
    that.user$ = new Observable<User>();
  }

  loginWithPhoneNumber(phoneNumber: string) {
    const that = this;
    that.connecting = true;
    cordova.plugins.firebase.auth.verifyPhoneNumber(phoneNumber, 30000).then(function (verificationId) {
      console.log('verificationId', verificationId);
      that.verificationID = verificationId;
      that.router.navigateByUrl(`/verification`);
    });
  }

  verifSmsCode(verificationId: string, smsCode: string, firstName: string) {
    const that = this;

    const signInCredential = firebase.auth.PhoneAuthProvider.credential(verificationId, smsCode);
    console.log('signInCredential: ', signInCredential);
    cordova.plugins.firebase.auth.signInWithVerificationId(verificationId, smsCode).then(function (userInfo) {
      console.log('userinfo', userInfo);
      that.userObj.uid = userInfo.uid;
      that.userObj.phoneNumber = userInfo.phoneNumber;
      that.userObj.name = firstName;
      that.user$ = of(that.userObj);
      that.updateUserData(that.user$);
      that.router.navigateByUrl(`/tabs/conversations/${userInfo.uid}`);
    });
  }

  private updateUserData(user) {
    // Sets user data to firestore on login

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.value.uid}`);

    const data: User = {
      uid: user.value.uid,
      phoneNumber: user.value.phoneNumber,
      name: user.value.name
    };

    return userRef.set(data, { merge: true });

  }

  logout() {
    const that = this;
    that.user$ = of(null);
  }
}