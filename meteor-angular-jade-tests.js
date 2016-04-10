// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by meteor-angular-jade.js.
import { name as packageName } from "meteor/meteor-angular-jade";

// Write your tests here!
// Here is an example.
Tinytest.add('meteor-angular-jade - example', function (test) {
  test.equal(packageName, "meteor-angular-jade");
});
