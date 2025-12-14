module.exports = {
  apps: [{
    name: 'sail-kokokahi',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: __dirname, // Use the directory where this config file is located
    interpreter: 'node',
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
    time: true
  }]
};
