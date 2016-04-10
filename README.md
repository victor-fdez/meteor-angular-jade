# Jade Compile Plugin for Meteor Angular

## Intro

Updating to 1.3 Meteor, I noticed that other plugins to compile 
Jade into angular templates did not explicitly import angular into 
their generated files using the following ecmascript import.

```javascript
import angular from 'angular';
import 'angular-meteor';
```

Therefore the generated code from those plugins would give errors 
in the client, because there would be no angular to reference in the
client unless you added the atmosphere js angular package. Try this
package if you want to use jade with NPM's angular package. 

## Instalation 

```bash
meteor add victor755:meteor-angular-jade
```

This package does not assume that you will use a specific version of 
angular so you will have to install that yourself else you will get
errors in your client. So use the following commands to install NPM's
angular and angular-meteor in your project.

```bash
meteor npm install --save angular angular-meteor
```

## Issues

I assumed that you would be using the following versions of NPM's
packages and atmosphere packages.

  * angular >= 1.4.7  
  * ecmascript >= 0.4.2

Let me know if you have other issues or concerns.

