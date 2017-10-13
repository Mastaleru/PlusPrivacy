package eu.operando.swarmService;

import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import eu.operando.feedback.entity.FeedbackQuestionListEntity;
import eu.operando.feedback.entity.FeedbackResultSwarmModel;
import eu.operando.swarmService.models.PfbSwarmEntity;
import eu.operando.swarmService.models.RegisterInfo;
import eu.operando.swarmService.models.RegisterSwarmEntity;
import eu.operando.swarmclient.SwarmClient;
import eu.operando.swarmclient.models.Swarm;
import eu.operando.swarmclient.models.SwarmCallback;

/**
 * Created by Edy on 11/3/2016.
 */

public class SwarmService {
    private static final String SWARMS_URL = "https://plusprivacy.com:8080";
    private static final String SWARMS_URL_DEBUG = "http://192.168.103.149:8080";
    private static final String SWARMS_URL_JOS = "http://192.168.100.144:9001";
    private static final String SWARMS_URL_CIPRIAN = "http://192.168.103.133:8080";

    private static SwarmService instance;

    private SwarmClient swarmClient;

    private SwarmService() {
        SwarmClient.init(SWARMS_URL);
        swarmClient = SwarmClient.getInstance();
    }

    public static SwarmService getInstance() {
        if (instance == null) {
            instance = new SwarmService();
        }

        return instance;
    }

    public void login(String username, String password, SwarmCallback<? extends Swarm> callback) {
        swarmClient.startSwarm(callback, "login.js", "userLogin", username, password);
    }

    public void logout(SwarmCallback<? extends Swarm> callback) {
        swarmClient.startSwarm("login.js", "logout", callback);
    }

    public void signUp(final String email, final String password, final SwarmCallback<? extends Swarm> callback) {
        //connect to swarms
        login("guest@operando.eu", "guest", new SwarmCallback<Swarm>() {
            @Override
            public void call(Swarm result) {
                //register user
                registerSwarm(email, password, new SwarmCallback<RegisterSwarmEntity>() {
                    @Override
                    public void call(RegisterSwarmEntity result) {
                        try {
                            callback.result(new JSONObject(new Gson().toJson(result)));
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                        //logout guest
                        logout(new SwarmCallback<Swarm>() {
                            @Override
                            public void call(Swarm result) {
//                                swarmClient.restartSocket();
                            }
                        });
                    }
                });
            }
        });
    }

    public void registerSwarm(String email, String password, final SwarmCallback<? extends Swarm> callback){
        swarmClient.startSwarm(callback, "register.js", "registerNewUser", new RegisterInfo(email, password, password));
    }

    public void resetPassword(final String email, final SwarmCallback<Swarm> callback) {
        login("guest@operando.eu", "guest", new SwarmCallback<Swarm>() {
            @Override
            public void call(Swarm result) {
                swarmClient.startSwarm(callback, "UserInfo.js", "resetPassword", email);
            }
        });
    }

    public void getIdentitiesList(SwarmCallback<? extends Swarm> callback) {
        swarmClient.startSwarm("identity.js", "getMyIdentities", callback);
    }

    public void getFeedbackQuestions(SwarmCallback<FeedbackQuestionListEntity> callback) {
        swarmClient.startSwarm("feedback.js", "getFeedbackQuestions", callback);
    }

    public void submitFeedback(SwarmCallback<Swarm> callback, Object... args) {
        swarmClient.startSwarm(callback, "feedback.js", "submitFeedback", args);
    }

    public void hasUserSubmittedAFeedback(SwarmCallback<FeedbackResultSwarmModel> callback) {
        swarmClient.startSwarm("feedback.js", "hasUserSubmittedAFeedback", callback);
    }

    public void getAllDeals(SwarmCallback<PfbSwarmEntity> callback) {
        swarmClient.startSwarm("pfb.js", "getAllDeals", callback);
    }

    public void acceptDeal(SwarmCallback<PfbSwarmEntity> callback, boolean accept, String offerId) {
        swarmClient.startSwarm(callback, "pfb.js", accept ? "acceptDeal" : "unsubscribeDeal", offerId);
    }
}
