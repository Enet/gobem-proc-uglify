'use strict';

var uglify = require('uglify-js'),
    redis = require('redis');

module.exports = function () {
    let client;

    return {
        before: function (next) {
            client = redis.createClient();
            client.expire('uglify-js', 86400);
            next();
        },

        process: function (next, input, output, args, content, path) {
            if (!content) return next();
            client.hget('uglify-js', content, function (error, reply) {
                if (reply === null) {
                    try {
                        output.set(path, uglify.minify(content, {fromString: true}).code);
                        client.hset('uglify-js', content, output.get(path), next);
                    } catch (error) {
                        output.set(path, content);
                        next(error);
                    }
                } else {
                    output.set(path, reply);
                    next();
                }
            });
        },

        after: function (next) {
            client.end();
            next();
        }
    };
};
