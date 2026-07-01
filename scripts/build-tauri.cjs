const { spawnSync } = require('node:child_process');

const vueCliService = require.resolve('@vue/cli-service/bin/vue-cli-service.js');

const result = spawnSync(process.execPath, [vueCliService, 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TAURI_BUILD: 'true',
  },
});

process.exit(result.status ?? 1);
