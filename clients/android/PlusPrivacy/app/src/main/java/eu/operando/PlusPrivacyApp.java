package eu.operando;

import android.app.Activity;
import android.app.Application;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;
import android.os.StrictMode;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.webkit.WebView;

import com.anthonycr.bonsai.Schedulers;
import com.squareup.leakcanary.LeakCanary;

import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import javax.inject.Inject;

import eu.operando.activity.MainActivity;
import eu.operando.feedback.repository.di.DaggerMyComponent;
import eu.operando.feedback.repository.di.MyComponent;
import eu.operando.feedback.repository.di.SharedPreferencesModule;
import eu.operando.lightning.app.AppComponent;
import eu.operando.lightning.app.AppModule;
import eu.operando.lightning.app.DaggerAppComponent;
import eu.operando.lightning.database.HistoryItem;
import eu.operando.lightning.database.bookmark.BookmarkExporter;
import eu.operando.lightning.database.bookmark.BookmarkModel;
import eu.operando.lightning.database.bookmark.legacy.LegacyBookmarkManager;
import eu.operando.lightning.preference.PreferenceManager;
import eu.operando.lightning.utils.FileUtils;
import eu.operando.lightning.utils.MemoryLeakUtils;
import eu.operando.lightning.utils.Preconditions;
import eu.operando.utils.ConnectivityReceiver;
import io.paperdb.Paper;


public class PlusPrivacyApp extends Application {

    private static final String TAG = "BrowserApp";

    @Nullable
    private static AppComponent sAppComponent;
    private static final Executor mIOThread = Executors.newSingleThreadExecutor();

    @Inject
    PreferenceManager mPreferenceManager;
    @Inject
    BookmarkModel mBookmarkModel;

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
    }

    @Override
    public void onCreate() {
        super.onCreate();

        Paper.init(this);

        if (BuildConfig.DEBUG) {
            StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()
                    .detectAll()
                    .penaltyLog()
                    .build());
            StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()
                    .detectAll()
                    .penaltyLog()
                    .build());
        }

        final Thread.UncaughtExceptionHandler defaultHandler = Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread thread, @NonNull Throwable ex) {

                if (BuildConfig.DEBUG) {
                    FileUtils.writeCrashToStorage(ex);
                }

                if (defaultHandler != null) {
                    defaultHandler.uncaughtException(thread, ex);
                } else {
                    System.exit(2);
                }
            }
        });

        sAppComponent = DaggerAppComponent.builder().appModule(new AppModule(this)).build();
        sAppComponent.inject(this);

        Schedulers.worker().execute(new Runnable() {
            @Override
            public void run() {
                List<HistoryItem> oldBookmarks = LegacyBookmarkManager.destructiveGetBookmarks(PlusPrivacyApp.this);

                if (!oldBookmarks.isEmpty()) {
                    // If there are old bookmarks, import them
                    mBookmarkModel.addBookmarkList(oldBookmarks).subscribeOn(Schedulers.io()).subscribe();
                } else if (mBookmarkModel.count() == 0) {
                    // If the database is empty, fill it from the assets list
                    List<HistoryItem> assetsBookmarks = BookmarkExporter.importBookmarksFromAssets(PlusPrivacyApp.this);
                    mBookmarkModel.addBookmarkList(assetsBookmarks).subscribeOn(Schedulers.io()).subscribe();
                }
            }
        });

        if (mPreferenceManager.getUseLeakCanary() && !isRelease()) {
            LeakCanary.install(this);
        }

        if (!isRelease() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        registerActivityLifecycleCallbacks(new MemoryLeakUtils.LifecycleAdapter() {
            @Override
            public void onActivityDestroyed(Activity activity) {
                Log.d(TAG, "Cleaning up after the Android framework");
                MemoryLeakUtils.clearNextServedView(activity, PlusPrivacyApp.this);
            }
        });

        injectSharedPref();

        mInstance = this;

    }

    private AlertDialog disconnectDialog;

    private void injectSharedPref() {
        myComponent = DaggerMyComponent.builder()
                .sharedPreferencesModule(new SharedPreferencesModule(getApplicationContext()))
                .build();
    }

    private static MyComponent myComponent;

    public static MyComponent getMyComponent() {
        return myComponent;
    }

    @NonNull
    public static AppComponent getAppComponent() {
        Preconditions.checkNonNull(sAppComponent);
        return sAppComponent;
    }

    @NonNull
    public static Executor getIOThread() {
        return mIOThread;
    }

    /**
     * Determines whether this is a release build.
     *
     * @return true if this is a release build, false otherwise.
     */
    public static boolean isRelease() {
        return !BuildConfig.DEBUG || BuildConfig.BUILD_TYPE.toLowerCase().equals("release");
    }

    public static void copyToClipboard(@NonNull Context context, @NonNull String string) {
        ClipboardManager clipboard = (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText("URL", string);
        clipboard.setPrimaryClip(clip);
    }


    private static PlusPrivacyApp mInstance;


    public static synchronized PlusPrivacyApp getInstance() {
        return mInstance;
    }

    public void setConnectivityListener(ConnectivityReceiver.ConnectivityReceiverListener listener) {
        ConnectivityReceiver.connectivityReceiverListener = listener;
    }

}
