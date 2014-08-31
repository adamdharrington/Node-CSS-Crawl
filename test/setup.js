"use strict";

global.chai   = require("chai");
global.sinon  = require("sinon");
global.expect = require("chai").expect;
global.AssertionError = require("chai").AssertionError;

var sinonChai = require("sinon-chai");
chai.use(sinonChai);