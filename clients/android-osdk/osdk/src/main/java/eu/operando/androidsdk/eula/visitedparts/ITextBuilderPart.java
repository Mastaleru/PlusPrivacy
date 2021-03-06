package eu.operando.androidsdk.eula.visitedparts;

import eu.operando.androidsdk.eula.visitor.ITextBuilderVisitor;

/**
 * Created by Matei_Alexandru on 13.10.2017.
 * Copyright © 2017 RomSoft. All rights reserved.
 */

public interface ITextBuilderPart {
    void accept(ITextBuilderVisitor textBuilderVisitor);
}
