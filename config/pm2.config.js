
module.exports = {
  apps: [{
    name:             'codeflower',
    script:           './server',
    exec_mode:        'cluster',
    instances:        4,
    watch:            false,
    error_file:       'logs/err.log',
    out_file:         'logs/out.log',
    merge_logs:       true,
    log_date_format:  'YYYY-MM-DD HH:mm:ss',
    env: {
        NODE_ENV: 'production'
    }
  }]
};