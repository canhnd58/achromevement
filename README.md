*This project is under development*
# Achromevement
[![Build Status](https://travis-ci.org/canhnd58/achromevement.svg?branch=master)](https://travis-ci.org/canhnd58/achromevement)
[![codecov](https://codecov.io/gh/canhnd58/achromevement/branch/master/graph/badge.svg)](https://codecov.io/gh/canhnd58/achromevement)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Earn achievements by using Google Chrome.

## Introduction
A chrome plugin to help your web browsing activities more interesting and beneficial.

Some achievements to name

- **Early Bird** - Open a page between 4:50 and 5:10 in the morning for n consecutive days
- **Researcher** - Visit n different sites
- **Self Control** - Use facebook for less than 1 hour a day for n consecutive days

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Nodejs and gulp-cli must be available as system commands.

If not, download nodejs installer from its [download page](https://nodejs.org/en/download/). Run the installer, then proceed to install gulp-cli with your command prompt

    npm install gulp-cli -g

### Building

Go into Achromevement root folder and execute

    npm install
    gulp build
    

### Installing

1. Open chrome and go to [extension manager](chrome://extensions/).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and choose achromevement/dist directory.

## Running the tests

    npm test

## Contributing 

Contributions are always welcome. Please check out the [Contributing to Achromevement guide](CONTRIBUTING.md) for guidelines about how to proceed.

Everyone involved in Achromevement is expected to follow the Achromevement [code of conduct](CODE_OF_CONDUCT.md). 

## License
Achromevement is released under the [MIT license](LICENSE).
