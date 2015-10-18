'use strict';

var uglify = require('uglify-js'),
    redis = require('redis');

module.exports = function (options) {
    options = options || {};

    let client = options.redisClient,
        key = options.redisKey || 'gobem-proc-uglify';

    return {
        before: function (next) {
            client = client || redis.createClient();
            client.expire(key, 86400);
            next();
        },

        process: function (next, input, output, config, content, path) {
            if (!content) return next();

            client.hget(key, content, function (error, reply) {
                if (reply === null) {
                    try {
                        output.set(path, uglify.minify(content, {fromString: true}).code);
                        client.hset(key, content, output.get(path), next);
                    } catch (error) {
                        output.set(path, content);
                        next(options.ignoreErrors ? null : error);
                    }
                } else {
                    output.set(path, reply);
                    next();
                }
            });
        },

        clear: function (next) {
            options.redisClient && client.end();
            next();
        }
    };
};
