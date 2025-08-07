module.exports = {
  apps: [{
    name: 'sail-kokokahi',
    script: 'npm',
    args: 'start',
    cwd: __dirname, // Use the directory where this config file is located
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
