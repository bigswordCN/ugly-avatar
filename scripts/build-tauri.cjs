const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('node:child_process');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('Download failed: ' + res.statusCode));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      try { fs.unlinkSync(dest); } catch (e) {}
      reject(err);
    });
  });
}

async function ensureWebView2() {
  const webviewDir = path.join(__dirname, '..', 'src-tauri', 'webview2');
  if (!fs.existsSync(webviewDir)) fs.mkdirSync(webviewDir, { recursive: true });

  const x64 = path.join(webviewDir, 'MicrosoftEdgeWebView2InstallerX64.exe');
  // Allow CI to provide a direct download URL via env var. This avoids hard-coding
  // a possibly stale Microsoft URL in the repo. Example in Actions: set WEBVIEW2_BOOTSTRAPPER_URL
  const downloadUrl = process.env.WEBVIEW2_BOOTSTRAPPER_URL;

  if (!downloadUrl) {
    console.warn('WEBVIEW2_BOOTSTRAPPER_URL not set — skipping WebView2 download.');
    console.warn('Place the installer at src-tauri/webview2/MicrosoftEdgeWebView2InstallerX64.exe or set the env var in CI.');
    return;
  }

  if (!fs.existsSync(x64)) {
    console.log('Downloading WebView2 bootstrapper to', x64);
    try {
      await download(downloadUrl, x64);
      console.log('WebView2 bootstrapper downloaded successfully');
    } catch (e) {
      console.warn('Failed to download WebView2 bootstrapper:', e);
      // Do not throw — continue build; bundle may be missing
    }
  } else {
    console.log('WebView2 bootstrapper already exists at', x64);
  }
}

(async () => {
  try {
    await ensureWebView2();
  } catch (e) {
    console.warn('ensureWebView2 error:', e);
  }

  const vueCliService = require.resolve('@vue/cli-service/bin/vue-cli-service.js');

  const result = spawnSync(process.execPath, [vueCliService, 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      TAURI_BUILD: 'true',
    },
  });

  process.exit(result.status ?? 1);
})();
