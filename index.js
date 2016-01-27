'use strict';

var path = require('path'),
    fs = require('fs'),
    uglify = require('uglify-js'),
    xxhash = global[Symbol.for('xxhash')] = global[Symbol.for('xxhash')] || require('xxhash'),
    re = /^\s*\/?\/?(\*|'|"|)\s*prevent\sprettydiff\s*\1\/?;?\s*$/m;

module.exports = function (options) {
    options = options || {};

    return {
        process: function (next, input, output, config, rawContent, rawPath) {
            if (!rawContent) return next();

            let key = xxhash.hash(new Buffer(rawContent), 0xCAFEBABE) + '',
                filePath = path.join(options.cacheDir + '', 'gobem-proc-uglify^' + key);

            fs.readFile(filePath, 'utf8', (error, fileContent) => {
                if (error) {
                    try {
                        output.set(rawPath, re.test(rawContent) ? rawContent : uglify.minify(rawContent, {
                            fromString: true
                        }).code);
                        fs.writeFile(filePath, output.get(rawPath), next);
                    } catch (error) {
                        output.set(rawPath, rawContent);
                        next(options.ignoreErrors ? null : error);
                    }
                } else {
                    output.set(rawPath, fileContent);
                    next();
                }
            });
        }
    };
};
