//
//  UIRegistrationViewController.swift
//  Operando
//
//  Created by Costin Andronache on 4/26/16.
//  Copyright © 2016 Operando. All rights reserved.
//

import UIKit

struct UIRegistrationViewControllerCallbacks{
    let whenUserRegisters: RegistrationCallback?
    let whenUserWantsToSignIn: VoidBlock?
}


class UIRegistrationViewController: UIViewController {
    @IBOutlet weak var registrationView: UIRegistrationView!
    private var callbacks: UIRegistrationViewControllerCallbacks?

    
    func setupWith(callbacks: UIRegistrationViewControllerCallbacks?){
        let _ = self.view
        self.callbacks = callbacks
        
        self.registrationView.logic.setupWith(callbacks: UIRegistrationViewLogicCallbacks(presentOkAlert: { alertMessage in
    
            OPViewUtils.showOkAlertWithTitle(title: "", andMessage: alertMessage)
            
        }, registrationCallback: callbacks?.whenUserRegisters, cancelCallback: callbacks?.whenUserWantsToSignIn))
        
    }
    
    @IBAction func signInButtonPressed(_ sender: AnyObject) {
        self.callbacks?.whenUserWantsToSignIn?()
    }
    
}
