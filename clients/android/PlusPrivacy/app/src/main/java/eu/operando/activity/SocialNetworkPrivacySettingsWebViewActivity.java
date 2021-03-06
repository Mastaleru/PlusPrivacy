package eu.operando.activity;

import android.content.Context;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import java.io.IOException;
import java.io.InputStream;

import eu.operando.R;
import eu.operando.customView.MyWebViewClient;
import eu.operando.utils.WebAppI;

/**
 * Created by Alex on 1/19/2018.
 */

public abstract class SocialNetworkPrivacySettingsWebViewActivity extends SocialNetworkWebViewBaseActivity implements MyWebViewClient.SocialNetworkInterface {

    protected String privacySettingsString;
    protected CookieManager cookieManager;
    protected JSONArray privacySettingsJSONArray;
    protected JSONArray usualSettings = new JSONArray();
    protected JSONArray preferencesSettings = new JSONArray();
    protected JSONArray activityControlsSettings = new JSONArray();
    private int totalQuestions;


    public abstract String getURL_MOBILE();

    protected abstract String getURL();

    public abstract WebViewClient getWebViewClient();

    public abstract WebAppI getWebAppInterface();

    public abstract String getJsFile();

    public abstract String getIsLoggedJsFile();

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_facebook_web_view);
        initData();
        initUI();
    }

    public void initData() {
        privacySettingsString = getIntent().getStringExtra(
                SocialNetworkFormBaseActivity.PRIVACY_SETTINGS_TAG);
        try {
            privacySettingsJSONArray = new JSONArray(privacySettingsString);
            for (int j = 0; j < privacySettingsJSONArray.length(); ++j) {

                JSONObject setting = privacySettingsJSONArray.getJSONObject(j);
                if (setting.has("method_type")) {
                    if (setting.get("method_type").equals("GET")) {
                        preferencesSettings.put(setting);
                    } else {
                        activityControlsSettings.put(setting);
                    }
                } else {
                    usualSettings.put(setting);
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        Log.e(SocialNetworkFormBaseActivity.PRIVACY_SETTINGS_TAG, privacySettingsString);
        totalQuestions = privacySettingsJSONArray.length();
    }

    @Override
    protected void initProgressDialog() {
        if (!isFinishing()) {
            frameLayout.setVisibility(View.VISIBLE);
            progressBar.setVisibility(View.VISIBLE);
        }
    }

    public void injectCssFile(String scriptFile) {

        InputStream input;
        try {
            input = getAssets().open(scriptFile);
            byte[] buffer = new byte[input.available()];
            input.read(buffer);
            input.close();

            String encoded = Base64.encodeToString(buffer, Base64.NO_WRAP);
            myWebView.loadUrl("javascript:(function() {" +
                    "var parent = document.getElementsByTagName('head').item(0);" +
                    "var style = document.createElement('style');" +
                    "style.type = 'text/css';" +
                    // Tell the browser to BASE64-decode the string into your script !!!
                    "style.innerHTML = window.atob('" + encoded + "');" +
                    "parent.appendChild(style)" +
                    "})()");

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    public class WebAppInterface extends WebAppI {

        private String privacySettings;
        private int isJQueryLoaded;
        private boolean isUserLogged;
        private Context context;
        private int index = 0;

        public WebAppInterface(Context context, String privacySettings) {
            this.context = context;
            this.privacySettings = privacySettings;
        }

        @JavascriptInterface
        public String getPrivacySettings() {
            return privacySettings;
        }

        @JavascriptInterface
        public void showToast(String message) {
            Log.e("msg from the dark side", message);
        }

        @JavascriptInterface
        public void onFinishedLoadingCallback() {

            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (!isFinishing()) {
                        finish();
                        Toast.makeText(getApplicationContext(), "Settings Loaded", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void isLoaded(int jquery) {
            Log.e("WebAppI isLoaded", String.valueOf(jquery));
            isJQueryLoaded = jquery;
        }

        @JavascriptInterface
        public void isLogged(int isLogged) {
            Log.e("WebAppI isLogged", String.valueOf(isLogged));
            if (isLogged == 1) {
                triggered = true;
                myWebView.post(new Runnable() {
                    @Override
                    public void run() {
                        startInjecting();
                    }
                });
            }
            this.isUserLogged = isLogged != 0;
        }

        @JavascriptInterface
        public void setProgressBar() {
            index++;
            progressBar.setMax(totalQuestions);
            progressBar.setProgress(index);
        }

        @JavascriptInterface
        public void setProgressBar(int activityIndex, int totalActivity) {

            progressBar.setMax(totalActivity);
            progressBar.setProgress(index + activityIndex);
        }

        @JavascriptInterface
        public void setProgressBar(int activityIndex) {

            progressBar.setMax(totalQuestions);
            progressBar.setProgress(index + activityIndex);
        }

        public int getIsJQueryLoaded() {
            return isJQueryLoaded;
        }

        public boolean isUserLogged() {
            return isUserLogged;
        }

        public void setIsJQueryLoaded(int isJQueryLoaded) {
            this.isJQueryLoaded = isJQueryLoaded;
        }
    }
}
