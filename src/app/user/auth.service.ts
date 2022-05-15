import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs/Subject";

import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import { User } from "./user.model";

import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

// define user pool metadata
const poolData = {
  UserPoolId: "us-east-1_8wCvxSgOk", // Your user pool id here
  ClientId: "5p8og2sefobf9ldhi77dpq2vca", // Your client id here
};

const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();
  registeredUser: CognitoUser;

  constructor(private router: Router) {}

  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      username: username,
      email: email,
      password: password,
    };

    const attributeList: CognitoUserAttribute[] = [];
    const emailAttribute = {
      Name: "email",
      Value: user.email,
    };

    attributeList.push(new CognitoUserAttribute(emailAttribute));
    // users call sign up to the user pool
    userPool.signUp(
      user.username,
      user.password,
      attributeList,
      null,
      (err, result) => {
        if (err) {
          this.authDidFail.next(true);
          this.authIsLoading.next(false);
          return;
        }
        this.authDidFail.next(false);
        this.authIsLoading.next(false);
        this.registeredUser = result.user;
      }
    );

    return;
  }
  confirmUser(username: string, code: string) {
    this.authIsLoading.next(true);
    const userData = {
      Username: username,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.router.navigate(["/"]);
    });
  }
  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);
    const authData = {
      Username: username,
      Password: password,
    };
    this.authStatusChanged.next(true);
    return;
  }
  getAuthenticatedUser(): any {}
  logout() {
    this.authStatusChanged.next(false);
  }
  isAuthenticated(): Observable<boolean> {
    const user = this.getAuthenticatedUser();
    const obs = Observable.create((observer) => {
      if (!user) {
        observer.next(false);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
    return obs;
  }
  initAuth() {
    this.isAuthenticated().subscribe((auth) =>
      this.authStatusChanged.next(auth)
    );
  }
}
