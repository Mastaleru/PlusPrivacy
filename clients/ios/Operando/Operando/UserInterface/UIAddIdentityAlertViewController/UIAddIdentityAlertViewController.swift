//
//  UIAddIdentityAlertViewController.swift
//  Operando
//
//  Created by Costin Andronache on 10/17/16.
//  Copyright © 2016 Operando. All rights reserved.
//

import UIKit


struct UIAddIdentityViewControllerCallbacks {
    let onExitWithIdentity: ((_ identityIfAny: String?) -> Void)?
}

struct UIAddIdentityViewControllerLogicCallbacks {
    let displayStatusPopupWithMessage: CallbackWithString?
    let displayAlertWithMessage: CallbackWithString?
    let dismissStatusPopup: VoidBlock?
    let presentError: ((_ error: NSError) -> Void)?
}

class UIAddIdentityViewControllerLogic: NSObject {
    let identityViewLogic: UIAddIdentityViewLogic
    let logicCallbacks: UIAddIdentityViewControllerLogicCallbacks
    
    var identitiesRepository: IdentitiesManagementRepository?
    var callbacks: UIAddIdentityViewControllerCallbacks?
    
    init(identityViewLogic: UIAddIdentityViewLogic, logicCallbacks: UIAddIdentityViewControllerLogicCallbacks){
        self.identityViewLogic = identityViewLogic;
        self.logicCallbacks = logicCallbacks;
        super.init()
    }
    
    func setupWith(identitiesRepository: IdentitiesManagementRepository?, callbacks: UIAddIdentityViewControllerCallbacks?){
        self.identitiesRepository = identitiesRepository;
        self.callbacks = callbacks;
        
        weak var weakSelf = self;
        
        identitiesRepository?.getCurrentListOfDomainsWith(completion: { (domains, error) in
            if let error = error {
                weakSelf?.logicCallbacks.presentError?(error)
                return
            }
            
            weakSelf?.identityViewLogic.setupWith(domains: domains, andCallbacks: weakSelf?.callbacksWith(repository: identitiesRepository))
            
            weakSelf?.fillWithAutoGeneratedIdentity()
        })

    }
    
    private func fillWithAutoGeneratedIdentity() {
        weak var weakSelf = self
        self.identitiesRepository?.generateNewIdentityWith(completion: { (alias, error) in
            if let error = error {
                weakSelf?.logicCallbacks.presentError?(error)
                return
            }
            
            weakSelf?.identityViewLogic.changeAlias(to: alias)
        })
    }
    
    private func callbacksWith(repository: IdentitiesManagementRepository?) -> UIAddIdentityViewCallbacks {
        
        weak var weakSelf = self;
        weak var weakRepository  = repository;
        
        return UIAddIdentityViewCallbacks(whenPressedClose: {
            weakSelf?.callbacks?.onExitWithIdentity?(nil)
        },
                                          whenPressedSave: { result in
            
            weakSelf?.logicCallbacks.displayStatusPopupWithMessage?(Bundle.localizedStringFor(key: kConnectingLocalizableKey))
            
            weakRepository?.add(identity: result.asFinalIdentity, withCompletion: { (_, error) in
                weakSelf?.logicCallbacks.dismissStatusPopup?()
                if let error = error {
                    weakSelf?.logicCallbacks.presentError?(error)
                    return
                }
                
                weakSelf?.callbacks?.onExitWithIdentity?(result.asFinalIdentity)
            })
            
        }, whenPressedRefresh: {
           weakSelf?.fillWithAutoGeneratedIdentity()
        })
        
    }
    
}

class UIAddIdentityAlertViewController: UIViewController {
    
    @IBOutlet weak var addIdentityView: UIAddIdentityView!
    
    lazy var logic: UIAddIdentityViewControllerLogic = {
        
        let callbacks: UIAddIdentityViewControllerLogicCallbacks = UIAddIdentityViewControllerLogicCallbacks(displayStatusPopupWithMessage: { status in
            ProgressHUD.show(status)
        }, displayAlertWithMessage: { message in
            OPViewUtils.showOkAlertWithTitle(title: "", andMessage: message)
            
        }, dismissStatusPopup: ProgressHUD.dismiss, presentError: OPErrorContainer.displayError)
        
        return UIAddIdentityViewControllerLogic(identityViewLogic: self.addIdentityView.logic, logicCallbacks: callbacks)
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.addIdentityView.isHidden = true
        self.addIdentityView.layer.cornerRadius = 10

    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.addIdentityView.isHidden = false        
    }
    
    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        self.addIdentityView.endEditing(true)
    }
    
    
    func setupWith(identitiesRepository: IdentitiesManagementRepository?, callbacks: UIAddIdentityViewControllerCallbacks?){
        
        let _ = self.view
        self.logic.setupWith(identitiesRepository: identitiesRepository, callbacks: callbacks)
        
    }
}
