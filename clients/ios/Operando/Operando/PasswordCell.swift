//
//  PasswordCell.swift
//  Operando
//
//  Created by RomSoft on 12/21/17.
//  Copyright © 2017 Operando. All rights reserved.
//

import UIKit
protocol PasswordCellDelegate {
    func pressedChangeButton()
}

class PasswordCell: UITableViewCell {
    
    static let identifierNibName = "PasswordCell"
    
    var delegate: PasswordCellDelegate?

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }
    
    @IBAction func pressedChangeButton(_ sender: Any) {
        delegate?.pressedChangeButton()
    }
}
