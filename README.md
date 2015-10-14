# gobem-proc-uglify
This processor for [gobem](https://github.com/Enet/gobem) minifies javascript files using **uglify-js**. If an argument `ignore-errors` is passed and error occured, raw javascript will be written instead minified one. Empty files are just skipped.

**gobem-proc-uglify** requires redis database to cache results.

### Example for **build.gb**
```javascript
select 0 ^components\/(\w+)\/\1\.js$
process gobem-proc-uglify ignore-errors
write 1
```
