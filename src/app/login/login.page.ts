import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var cordova: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  connecting = false;
  user = {};

  constructor(private router: Router) { }

  ngOnInit() {
  }

  loginWithPhoneNumber() {
    const that = this;
    this.connecting = true;
    cordova.plugins.firebase.auth.verifyPhoneNumber('+33688911341', 30000).then(function (verificationId) {
      console.log('verificationId', verificationId);
      cordova.plugins.firebase.auth.signInWithVerificationId(verificationId, '123456').then(function (userInfo) {
        console.log('userInfo', userInfo);
        that.user = userInfo;
        that.router.navigateByUrl(`/tabs/conversations/${userInfo.uid}`);
      });
    });
  }
}
