Node CSS Crawl
======================

A customisable command line interface (CLI) tool for performing research on the usage of CSS on a sample of websites. By default the tool crawls the Alexa page-ranked top one million websites and writes a report to the current working directory.

Built on NodeJS and PhantomJS, Node CSS Crawl analyses websites in a real headless browser context to give fast and accurate results.

Features
-----------------

Node CSS Crawl was built to perform research on the real-world usage of CSS on website using various front-end UI frameworks. As such the framework identification module was built to help identify unedited frameworks including Bootstrap, Foundation and Pure. It can easily be extended with new versions and frameworks.

The metrics used are a combination of descriptive indicators and code quality metrics from academic literature.

Installation tips
------------------

1. Ensure you have NodeJS and PhantomJS installed locally (PhantomJS is not a Node module, it must be sources outside of NPM).
2. In the root directory run `$ npm install` to add all dependencies locally.
3. Once complete run `mocha` to check failing unit tests
4. Run `node css-crawl.js` to perform a first run of the application.
5. Select (2) under functions to get the Alexa page-rank list from source.
6. Once complete, the application will quit. Run `mocha` from the command line again to see passing tests.
7. Node-CSS-Crawl is now set up, happy researching.

Usage Guidelines
-----------------
### Adding CSS Templates
If you would like to personalise the CSS Templates[^1] that Node-CSS-Crawl includes in its study, simple download copies of the style sheets you wish to add, put them in `lib/templates/stylesheets` and run Node-CSS-Crawl selecting option 1. 

The output can be found in `lib/templates/template-data/unique.json` and the unique identifies generated can be incorporated in the `lib/injection/inject.js` file as a new item and the full selector list should be added to `lib/template-utilisation.js`, also as a new item. 
- tip: `inject.js` must be minified, as it is inject.min.js used by PhantomJS




Licence
-------------
This application and all code, documentation and imagery associated are, unless otherwise stated, the exclusive property of Adam Harrington (adamdharrington@gmail.com) hereafter refereed to as the author. 

The Author retains the exclusive right to use share and distribute this work at his sole discretion.


---------------------

### Notes


[^1]: CSS Template is a term used in this context to refer to only the style sheet parts of frameworks, libraries or other third-party code where the styles are the entire entire library (PureCSS, AnimateCSS) or part of a larger framework (Bootstrap, jQueryUI).
 
