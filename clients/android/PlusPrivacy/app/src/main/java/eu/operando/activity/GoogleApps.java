package eu.operando.activity;

import android.webkit.CookieManager;

/**
 * Created by Alex on 03.04.2018.
 */

public class GoogleApps extends SocialNetworkAppsActivity {

    @Override
    public String getURL_MOBILE() {
        return getURL();
    }

    @Override
    protected String getURL() {
        return "https://myaccount.google.com/permissions";
    }

    @Override
    public String getJsFile() {
        return "google_apps.js";
    }

    @Override
    public String getIsLoggedJsFile() {
        return "google_is_logged.js";
    }

    @Override
    protected Class getAppListClass() {
        return GoogleAppList.class;
    }


    @Override
    public void onPageCommitVisible() {

    }

    @Override
    public void onPageFinished() {

        onPageListener();

    }

}
