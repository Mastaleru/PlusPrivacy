//
//  UISetPrivacyFlowController.swift
//  FBSecurityQuestionnaire
//
//  Created by Catalin Pomirleanu on 2/22/17.
//  Copyright © 2017 RomSoft. All rights reserved.
//

import UIKit

class UISetPrivacyFlowController: UIFlowController {
    
    let configuration : UIFlowConfiguration
    var childFlow : UIFlowController?
    
    required init(configuration : UIFlowConfiguration) {
        self.configuration = configuration
    }
    
    func start() -> UIMainViewController? {
        let mainScreenVC = UIViewControllerFactory.getSetPrivacyViewController()
        configuration.navigationController?.pushViewController(mainScreenVC, animated: true)
        return nil
    }
}
