//
//  PrivacyWizardRepository.swift
//  Operando
//
//  Created by RomSoft on 2/6/18.
//  Copyright © 2018 Operando. All rights reserved.
//

import Foundation
protocol PrivacyWizardRepository {
    
    func getAllQuestions(withCompletion completion: ((AMPrivacySettings?, NSError?) -> Void)?)
}
