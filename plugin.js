var minify = Npm.require('html-minifier').minify;
var jade = Npm.require('jade');
var jadeOpts = {pretty:true, compileDebug:false};
var babelCompiler = new BabelCompiler({
   react: true
});

Plugin.registerSourceHandler(
  'ng.jade', 
  {
    isTemplate: true,
    archMatching: 'web'
  }, 
  function(compileStep) 
  {
    var contents = compileStep.read().toString('utf8');
    /**
     * setup babel options
     */
    var babelOptions = Babel.getDefaultOptions();
    babelOptions.sourceMap = false;
    babelOptions.ast = false;
    jadeOpts.filename = compileStep.fullInputPath;
    contents = jade.compile(contents, jadeOpts)();
    /**
     * setup paths
     */
    var newPath = compileStep.inputPath;
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
      import 'angular-templates';
      angular.module('angular-templates').run(['$templateCache', function($templateCache) {
        $templateCache.put('${newPath}', '${minifiedHtml}');
      }]);`;
    /**
     * generate es6 javascript
     */
    console.log('compiling : '+compileStep.inputPath+' -> '+newPath);
    console.log(`input file: ${results}`);
    var compileResult = Babel.compile(
      results,
      babelOptions
    );
    compileStep.addJavaScript({
      path : newPath,
      data : compileResult.code, //results.replace(/\n/g, '\\n'),
      sourcePath : compileStep.inputPath
    });
  }
);
