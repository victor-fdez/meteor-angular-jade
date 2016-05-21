var minify = Npm.require('html-minifier').minify;
var jade = Npm.require('jade');
var jadeOpts = {pretty:true, compileDebug:false};
var babelCompiler = new BabelCompiler({
   react: true
});
// CompileResult is a {source, sourceMap} object.
class NgJadeCompiler extends CachingCompiler {
  constructor() {
    super({
      compilerName: 'ngJadeCompiler',
      defaultCacheSize: 1024*1024*10,
    });
  }
  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }
  compileResultSize(compileResult) {
    //console.log('result-size');
    //console.log(compileResult);
    return compileResult.code.length;
  }
  compileOneFile(inputFile) {
    let packagePrefix = '';
    if (inputFile.getPackageName()) {
      packagePrefix += `/packages/${inputFile.getPackageName()}/`;
    }

    let inputPath = packagePrefix + inputFile.getPathInPackage();
    let contents = inputFile.getContentsAsString();
    /**
     * setup babel options
     */
    var babelOptions = Babel.getDefaultOptions();
    babelOptions.sourceMap = true;
    babelOptions.ast = false;
    jadeOpts.filename = inputPath;
    contents = jade.compile(contents, jadeOpts)();
    /**
     * setup paths
     */
    var newPath = inputPath;
    newPath = newPath.replace(/\\/g, "/");
    var newerPath = newPath.replace(".ng.jade", ".js");
    newPath = newPath.replace(".ng.jade", ".html");
    /**
     * minify html
     */
    var minifiedHtml = minify(
      contents.replace(/'/g, "\\'"), 
      {
        collapseWhitespace : true,
        conservativeCollapse : true,
        removeComments : true,
        minifyJS : true,
        minifyCSS: true,
        processScripts : ['text/ng-template']
      }
    );
    /**
     * generate javascript 
     */
    var results = `
      import angular from 'angular';
      import 'meteor/angular-templates';
      angular.module('angular-templates').run(['$templateCache', function($templateCache) {
        $templateCache.put('${newPath}', '${minifiedHtml}');
      }]);`;
    /**
     * generate es6 javascript
     */
    //console.log('compiling : '+inputPath+' -> '+newPath);
    //console.log(`input file: ${results}`);
    var compileResult = Babel.compile(
      results,
      babelOptions
    );
    //console.log(compileResult);
    return compileResult;
  }
  addCompileResult(inputFile, compileResult) {
    let packagePrefix = '';
    if (inputFile.getPackageName()) {
      packagePrefix += `/packages/${inputFile.getPackageName()}/`;
    }
    let inputPath = packagePrefix + inputFile.getPathInPackage();
    let newPath = inputPath;
    newPath = newPath.replace(/\\/g, "/");
    let newerPath = newPath.replace(".ng.jade", ".js");
    newPath = newPath.replace(".ng.jade", ".html");
    //console.log(`adding javascript ${inputPath} -> ${newPath}`);
    inputFile.addJavaScript({
      path: newPath,
      sourcePath: inputPath,
      data: compileResult.code,
      sourceMap: compileResult.map,
    });
  }
}

Plugin.registerCompiler({
  extensions: ['ng.jade'],
  archMatching: 'web',
  isTemplate: true 
}, () => new NgJadeCompiler());
