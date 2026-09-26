package ar.kekule.dibujos;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private static final int PICK_FILE = 1;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setBuiltInZoomControls(false);
        s.setSupportZoom(false);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                startActivityForResult(Intent.createChooser(i, "Abrir proyecto"), PICK_FILE);
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == PICK_FILE && fileCallback != null) {
            Uri[] r = (res == RESULT_OK && data != null && data.getData() != null) ? new Uri[]{data.getData()} : null;
            fileCallback.onReceiveValue(r);
            fileCallback = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    private void toast(final String msg) {
        runOnUiThread(new Runnable() { public void run() { Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show(); } });
    }

    private static void write(OutputStream os, byte[] bytes) throws java.io.IOException {
        try { os.write(bytes); } finally { os.close(); }
    }

    class Bridge {
        // Guarda PNG/SVG/JSON en la carpeta Descargas
        @JavascriptInterface
        public void saveFile(String name, String mime, String b64) {
            try {
                byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                    v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                    v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Dibujos de Quimica");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    write(getContentResolver().openOutputStream(uri), bytes);
                } else {
                    if (checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        requestPermissions(new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE}, 2);
                        toast("Dale permiso de almacenamiento y volvé a exportar.");
                        return;
                    }
                    File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "Dibujos de Quimica");
                    dir.mkdirs();
                    write(new FileOutputStream(new File(dir, name)), bytes);
                }
                toast("Guardado en Descargas/Dibujos de Quimica/" + name);
            } catch (Exception e) {
                toast("No se pudo guardar: " + e.getMessage());
            }
        }
    }
}
