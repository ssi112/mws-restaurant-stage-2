# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality.

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer.

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

*Alternative to Python server*
- First install Node.js then install NPM server
  - npm install http-server -g (-g flag install its globally)
- Run it from your project directory
  - http-server -a localhost -p 8000

Additional info: [link to httpserver doc](https://www.npmjs.com/package/httpserver)

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Leaflet.js and Mapbox:

The original project used Google Maps. It was converted to use Mapbox. You need to replace <your MAPBOX API KEY HERE> with a token from Mapbox. Note the token is in config.js file.

### Contents of config.js file:

```
var config = {
  MapBoxKey : 'your MAPBOX API KEY HERE'
}
```

Additional info on [creating config.js](https://gist.github.com/derzorngottes/3b57edc1f996dddcab25)

*Be certain to add config.js to the .gitignore file*

## Project Overview: Stage 2
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Two, you will take the responsive, accessible design you built in Stage One and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using Lighthouse.

- Converted to pull data from external Sails server
- Added use of IndexedDB to store JSON data for offline first, network second
- *Note using J. Archibald's IndexedDB Promise library*
- Added favicon.ico
- Added manifest.json plus icons for PWA

**Lighthouse Audit Score - Minimum Specifications**
- PWA > 90
- Performance > 70
- Accessibility > 90

**Lighthouse Audit Settings**
Using Chrome Canary - Disable all extensions or use Incognito window
   1. Device: Mobile
   2. Audits: Performance, Progressive Web App, Accessibility
   3. Throttling: Simulated Fast 3G, 4x CPU Slowdown

**Audit Results Using Above**
- PWA = 92
- Performance =  92
- Accessibility = 97

If No throttling chosen the scores results are as follows:
- PWA = 92
- Performance =  100
- Accessibility = 97

