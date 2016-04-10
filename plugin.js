var minify = Npm.require('html-minifier').minify;
var jade = Npm.require('jade');
var jadeOpts = {pretty:true, compileDebug:false};
var babelCompiler = new BabelCompiler({
   react: true
});

console.log("Registering ng.jade");
Plugin.registerSourceHandler(
  'ng.jade', 
  {
    isTemplate: true,
    archMatching: 'web'
  }, 
  function(compileStep) 
  {
    var contents = compileStep.read().toString('utf8');
    var babelOptions = Babel.getDefaultOptions();
    babelOptions.sourceMap = false;
    babelOptions.ast = false;
    jadeOpts.filename = compileStep.fullInputPath;
    contents = jade.compile(contents, jadeOpts)();
    var newPath = compileStep.inputPath;
    newPath = newPath.replace(/\\/g, "/");
    var newerPath = newPath.replace(".ng.jade", ".js");
    newPath = newPath.replace(".ng.jade", ".html");

    var results = 'import angular from \'angular\'; ' +
      'import \'angular-meteor\';'+
      'angular.module(\'angular-meteor\').run([\'$templateCache\', function($templateCache) {' +
      '$templateCache.put(\'' + newPath + '\', \'' +
        minify(contents.replace(/'/g, "\\'"), {
          collapseWhitespace : true,
          conservativeCollapse : true,
          removeComments : true,
          minifyJS : true,
          minifyCSS: true,
          processScripts : ['text/ng-template']
        }) + '\');' +
    '}]);';

    var compileResult = Babel.compile(
      results,
      babelOptions
    );

    //console.log(compileResult.code);
    //console.log(compileStep.fullInputPath + " -> " + newerPath);
    compileStep.addJavaScript({
      path : newerPath,
      data : compileResult.code, //results.replace(/\n/g, '\\n'),
      sourcePath : compileStep.inputPath
    });
  }
);
