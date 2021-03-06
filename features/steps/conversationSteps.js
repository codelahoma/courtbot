var {defineSupportCode} = require('cucumber');
var request = require('request');
var Chance = require('chance');
var cProc = require("child_process");
var chai = require("chai");
var xml2js = require("xml2js");
var expect = chai.expect;
var {MockCase} = require("../helpers/fakeService");

var chance = Chance();

defineSupportCode(function({Given, Then, When, Before, After}) {
  Given('A case exists with multiple parties with case number {arg1:stringInDoubleQuotes} and the following parties:', function (arg1, table, callback) {
    MockCase(arg1, table.rows().map(r => r[0]));
    this.caseNumber = arg1;
    callback();
  });

  When('I send courtbot a text with the name of that case', function (callback) {
    var world = this;
    this.phoneNumber = chance.phone();
    //hit courtbot's sms endpoint and send the case information
    request.post("http://localhost:5000/sms", {
      form: {
        Body: this.caseNumber,
        From: this.phoneNumber
      }
    }, function(error, response, body) {
      xml2js.parseString(body, function(err, result) {
        console.dir(result);
        world.courtbotResponse = result.Response.Sms[0];
        console.dir(body);
        setTimeout(callback, 1000);
      });
    });
  });

  When('I send courtbot a random bit of text', function (callback) {
    var world = this;
    this.randomText = chance.guid().toUpperCase();
    //hit courtbot's sms endpoint and send the case information
    request.post("http://localhost:5000/sms", {
      form: {
        Body: this.randomText,
        From: this.phoneNumber
      }
    }, function(error, response, body) {
      xml2js.parseString(body, function(err, result) {
        console.dir(result);
        world.courtbotResponse = result.Response.Sms[0];
        console.dir(body);
        setTimeout(callback, 1000);
      });
    });
  });

  When('I send courtbot the text {arg1:stringInDoubleQuotes} in response to its message', function (arg1, callback) {
    var world = this;
    //hit courtbot's sms endpoint and send the case information
    request.post("http://localhost:5000/sms", {
      form: {
        Body: arg1,
        From: this.phoneNumber
      }
    }, function(error, response, body) {
      xml2js.parseString(body, function(err, result) {
        console.dir(result);
        world.courtbotResponse = result.Response.Sms[0];
        console.dir(body);
        setTimeout(callback, 1000);
      });
    });
  });

  Then('courtbot responds with the following text:', function (string, callback) {
    expect(this.courtbotResponse.trim()).to.equal(string.replace("RANDOM TEXT", this.randomText).trim());
    callback();
  });
});
