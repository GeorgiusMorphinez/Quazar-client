const { override} = require('customize-cra');

module.exports = override(
    (config) => {
        config.devServer = {
            ...config.devServer,
            allowedHosts: ['localhost'] // Или ['localhost', '.host.example.com']
        };
        return config;
    }
);