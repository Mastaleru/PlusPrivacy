//
//  SwarmClientHelperTypes.swift
//  Operando
//
//  Created by Costin Andronache on 10/16/16.
//  Copyright © 2016 Operando. All rights reserved.
//

import Foundation

typealias SwarmClientCallback = ((_ error: NSError?, _ data: Any?) -> Void)


enum SwarmName: String
{
    
    case login          = "login.js"
    case register       = "register.js"
    case identity       = "identity.js"
    case pfb            = "pfb.js"
    case user           = "UserInfo.js"
    case notification   = "notification.js"
    case email          = "emails.js"
    case ude            = "UDESwarm.js"
    case feedback       = "feedback.js"
}

enum SwarmPhase: String
{
    case start = "start"
}

enum LoginConstructor: String
{
    case userLogin = "userLogin"
    case userLogout = "logout"
}

enum RegisterConstructor: String
{
    case registerNewUser = "registerNewUser"
}

enum IdentityConstructor: String
{
    case getMyIdentities = "getMyIdentities"
    case listDomains = "listDomains"
    case generateIdentity = "generateIdentity"
    case createIdentity = "createIdentity"
    case removeIdentity = "removeIdentity"
    case updateDefaultSubstituteIdentity = "updateDefaultSubstituteIdentity"
}

enum PFBConstructor: String
{
    case getAllDeals = "getAllDeals"
    case acceptPfbDeal = "acceptDeal"
    case unsubscribeDeal = "unsubscribeDeal"
    case getFeedbackQuestions = "getFeedbackQuestions"
    case hasUserSubmittedAFeedBack = "hasUserSubmittedAFeedback"
    case submitFeedback = "submitFeedback"
}

enum UserConstructor: String {
    
    case info = "getUserInfo"
    case updateUserInfo = "updateUserInfo"
    case changePassword = "changePassword"
    case deleteAccount = "deleteAccount"
    case sendActivationCode = "sendActivationCode"
}


enum NotificationConstructor: String {
    case getNotifications = "getNotifications"
    case dismissNotification = "dismissNotification"
}

enum EmailConstructor: String {
    case resetPassword = "resetPassword"
}

enum UDEConstructor: String {
    case getApplicationsOnDevice = "getApplicationsOnDevice"
}
