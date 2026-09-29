// PM2 process file for the GymPro backend (also serves the built website from frontend/dist).
//   npm run build:web                      # build the frontend first
//   pm2 start ecosystem.config.cjs         # start
//   pm2 start ecosystem.config.cjs --env production
//   pm2 logs gym-backend | pm2 restart gym-backend | pm2 save
// Secrets (DB, JWT, SMTP, Razorpay) stay in .env, which the server loads itself.
module.exports = {
  apps: [
    {
      name: 'gym-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1, // keep 1: Socket.io notifications are held in memory
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      time: true,
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        VITE_API_URL: 'http://localhost:5000/api',
        VITE_SOCKET_URL: 'http://localhost:5000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
