//
//  PPSupervisingModule.m
//  PPCloak
//
//  Created by Costin Andronache on 7/27/17.
//  Copyright © 2017 RomSoft. All rights reserved.
//

#import "PPSupervisingModule.h"
#import "LocationInputSupervisor.h"
#import "NSURLSessionSupervisor.h"
#import "ProximityInputSupervisor.h"
#import "PedometerInputSupervisor.h"
#import "ContactsInputSupervisor.h"
#import "MicrophoneInputSupervisor.h"
#import "CameraInputSupervisor.h"
#import "TouchIdSupervisor.h"
#import "MagnetometerInputSupervisor.h"
#import "AccelerometerInputSupervisor.h"
#import "BarometerInputSupervisor.h"
#import "PickerControllerSupervisor.h"
#import "BatteryInputSupervisor.h"
#import "DeviceInfoInputSupervisor.h"
#import "DeviceMotionInputSupervisor.h"
#import "GyroscopeInputSupervisor.h"
#import "DefaultConfirmationSupervisor.h"

#import "PlistReportsStorage.h"
#import "JRSwizzle.h"
#import "LocationInputSwizzler.h"
#import "CommonViewUtils.h"
#import "PPFlowBuilder.h"
#import "Security.h"
#import "SCDSender.h"
#import <PPCommonUI/PPCommonUI-Swift.h>
#import "PPBasicHttpBodyParser.h"


@interface PPSupervisingModuleModel()
@property (readwrite, strong, nonatomic) SCDDocument *scd;
@property (readwrite, strong, nonatomic) PPEventDispatcher *eventsDispatcher;
@end

@implementation PPSupervisingModuleModel

-(instancetype)initWithSCD:(SCDDocument *)scd eventsDispatcher:(PPEventDispatcher *)eventsDispatcher {
    if (self = [super init]) {
        self.scd = scd;
        self.eventsDispatcher = eventsDispatcher;
    }
    return self;
}

@end

@implementation PPSupervisingModuleCallbacks
@end

@interface PPSupervisingModule() <InputSupervisorDelegate>
@property (strong, nonatomic) PPSupervisingModuleModel *model;
@property (strong, nonatomic) PPSupervisingModuleCallbacks *callbacks;
@property (strong, nonatomic) PlistReportsStorage *plistRepository;
@end

@implementation PPSupervisingModule

-(void)beginSupervisingWithModel:(PPSupervisingModuleModel *)model callbacks:(PPSupervisingModuleCallbacks *)callbacks {
    
    self.model = model;
    self.callbacks = callbacks;
    self.plistRepository = [[PlistReportsStorage alloc] init];
}


-(NSArray<id<InputSourceSupervisor>>*)buildSupervisorsWithDocument:(SCDDocument*)document {
    NSMutableArray *result = [[NSMutableArray alloc] init];
    
    InputSupervisorModel *supervisorsModel = [[InputSupervisorModel alloc] init];
    supervisorsModel.scdDocument = document;
    supervisorsModel.delegate = self;
    supervisorsModel.privacyLevelAbuseDetector = [[PrivacyLevelAbuseDetector alloc] initWithDocument:document];
    
    supervisorsModel.httpAnalyzers = [self createHTTPAnalyzers];
    supervisorsModel.eventsDispatcher = [PPEventDispatcher sharedInstance];
    
    
    NSArray *supervisorClasses = @[[MagnetometerInputSupervisor class],
                                   [ProximityInputSupervisor class],
                                   [PedometerInputSupervisor class],
                                   [LocationInputSupervisor class],
                                   [AccelerometerInputSupervisor class],
                                   [BarometerInputSupervisor class],
                                   [TouchIdSupervisor class],
                                   [AVCameraInputSupervisor class],
                                   [MicrophoneInputSupervisor class],
                                   [ContactsInputSupervisor class],
                                   [NSURLSessionSupervisor class],
                                   [PickerControllerSupervisor class],
                                   [BatteryInputSupervisor class],
                                   [DeviceInfoInputSupervisor class],
                                   [DeviceMotionInputSupervisor class],
                                   [GyroscopeInputSupervisor class],
                                   [DefaultConfirmationSupervisor class]
                                   ];
    
    for (Class class in supervisorClasses) {
        id supervisor = [[class alloc] init];
        [supervisor setupWithModel:supervisorsModel];
        [result addObject:supervisor];
    }
    
    
    return  result;
}

-(HTTPAnalyzers*)createHTTPAnalyzers {
    HTTPAnalyzers *analyzers = [[HTTPAnalyzers alloc] init];
    analyzers.locationHTTPAnalyzer = [[LocationHTTPAnalyzer alloc] initWithHttpBodyParser:[[PPBasicHttpBodyParser alloc] init]];
    
    analyzers.batteryHTTPAnalyzer = [[BatteryHttpAnalyzer alloc] initWithHttpBodyParser:[[PPBasicHttpBodyParser alloc] init]];
    
    analyzers.basicAnalyzer = [[BaseHTTPAnalyzer alloc] initWithHttpBodyParser:[[PPBasicHttpBodyParser alloc] init]];
    
    return analyzers;
}



-(void)newURLHostViolationReported:(PPAccessUnlistedHostReport *)report {
    
    [self.plistRepository addUnlistedHostReport:report withCompletion:nil];
    NSString *notification = [NSString stringWithFormat:@"Accessed unlisted host %@", report.urlHost];
    
    SAFECALL(self.callbacks.presentNotificationCallback, notification)
}

-(void)newUnlistedInputAccessViolationReported:(PPUnlistedInputAccessViolation *)report {
    [self.plistRepository addUnlistedInputReport:report withCompletion:nil];
    NSString *notification = [NSString stringWithFormat:@"Accessed unlisted input %@", InputType.namesPerInputType[report.inputType]];
    
    SAFECALL(self.callbacks.presentNotificationCallback, notification)
    
}


-(void)newPrivacyLevelViolationReported:(PPUsageLevelViolationReport *)report {
    
    NSString *message = [NSString stringWithFormat:@"Usage level violation for input: %@, data sent to: %@",
                         InputType.namesPerInputType[report.inputType], report.destinationURLForData];
    

    [self.plistRepository addPrivacyLevelReport:report withCompletion:nil];
}

-(void)newAccessFrequencyViolationReported:(PPAccessFrequencyViolationReport *)report{
    // must complete
}

-(void)newModuleDeniedAccessReport:(PPModuleDeniedAccessReport *)report{
    
    NSString *message = [NSString stringWithFormat:@"Denied access to framework [%@] for %@", report.moduleName, InputType.namesPerInputType[report.inputType]];
    [self.plistRepository addModuleDeniedAccessReport:report withCompletion:nil];
    SAFECALL(self.callbacks.presentNotificationCallback, message);
}

@end
