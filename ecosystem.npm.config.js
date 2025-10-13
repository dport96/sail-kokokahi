module.exports = {
  apps: [{
    name: 'sail-kokokahi',
    script: 'npm',
    args: 'start',
    cwd: __dirname,
    interpreter: 'none', // This tells PM2 not to use node interpreter for npm
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      PATH: process.env.PATH
    },
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Ubuntu-specific settings
    uid: process.getuid?.(),
    gid: process.getgid?.(),
    // Increase startup time for slower systems
    listen_timeout: 8000,
    kill_timeout: 5000
  }]
};
