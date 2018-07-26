/*
 * serviceworker.js for restaurant review (rrv)
 */

var RRV_CACHE = "rest-review-cache-v4";
var RRV_CACHE_URLS = [
  '/',  // include the root
  '/index.html',
  '/restaurant.html',
  '/index.js',
  '/css/styles.css',
  '/data/restaurants.json',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/img/1.jpg',
  '/img/1_320px.jpg',
  '/img/1_480px.jpg',
  '/img/2.jpg',
  '/img/2_320px.jpg',
  '/img/2_480px.jpg',
  '/img/3.jpg',
  '/img/3_320px.jpg',
  '/img/3_480px.jpg',
  '/img/4.jpg',
  '/img/4_320px.jpg',
  '/img/4_480px.jpg',
  '/img/5.jpg',
  '/img/5_320px.jpg',
  '/img/5_480px.jpg',
  '/img/6.jpg',
  '/img/6_320px.jpg',
  '/img/6_480px.jpg',
  '/img/7.jpg',
  '/img/7_320px.jpg',
  '/img/7_480px.jpg',
  '/img/8.jpg',
  '/img/8_320px.jpg',
  '/img/8_480px.jpg',
  '/img/9.jpg',
  '/img/9_320px.jpg',
  '/img/9_480px.jpg',
  '/img/10.jpg',
  '/img/10_320px.jpg',
  '/img/10_480px.jpg'
];


/*
 * possibly cach the leaflet maps by something akin to ...
    else if (event.request.url.startsWith('https://api.tiles'))
 */
this.addEventListener('install', function(event) {
  // pause the install event until we cache necessary assets
  event.waitUntil(
    caches.open('RRV_CACHE').then(function(cache) {
      return cache.addAll(RRV_CACHE_URLS);
    })
  );
});


/*
 * If the response is defined then there's a match and the cached
 * response is returned. If it's not defined, then no match and
 * the request needs to go to the web server to get it.
 */
/* !!! ORIGINAL CODE !!!
this.addEventListener('fetch', function(event) {
    event.respondWith(caches.match(event.request).then(function(response){
        if(response)
            return response; // return cached item
        return fetch(event.request).then(function(response) {
            return response; // else return whatever requested
        });
    }));
});
*/


/*
 * !!! New and Improve fetch event listener !!!
 * Cache Strategy - cache 1st, falling back to network with frequent updates
 *
 * 1st test if request is either for the root or the index.html
 * returns the cached version of index.html, if found, or a promise to
 * return it from network if not in cache
 *
 * Test if request is for any other URLs that might be cached. If so,
 * return request from cache. If not found in cache, try to get it from
 * the network.
 *
 * Requests not matching either of these pass through and behave normally
 */
self. addEventListener("fetch", function(event) {
  let requestURL = new URL(event.request.url);
  // handle request for index.html
  if (requestURL.pathname === "/" || requestURL.pathname === "/index.html") {
    event.respondWith(
      caches.open(RRV_CACHE).then(function(cache) {
        return cache.match("/index.html").then(function(cachedResponse) {
          let fetchPromise = fetch("/index.html")
            .then(function(networkResponse) {
              cache.put("/index.html", networkResponse.clone());
              return networkResponse;
            });
          return cachedResponse || fetchPromise;
        });
      })
    );

  // handle requests for restaurant.html
  } else if (requestURL.pathname === "/restaurant.html") {
    event.respondWith(
      caches.open(RRV_CACHE).then(function(cache) {
        return cache.match("/restaurant.html").then(function(cachedResponse) {
          let fetchPromise = fetch("/restaurant.html")
            .then(function(networkResponse) {
              cache.put("/restaurant.html", networkResponse.clone());
              return networkResponse;
            });
          return cachedResponse || fetchPromise;
        });
      })
    );

  } else if (
      RRV_CACHE_URLS.includes(requestURL.href) ||
      RRV_CACHE_URLS.includes(requestURL.pathname)
    ) {
      event.respondWith(
        caches.open(RRV_CACHE).then(function(cache) {
          return cache.match(event.request).then(function(response) {
            return response || fetch(event.request);
          });
        })
      );
    }
    /*
     * !!! TO DO !!!
     * let the browser decide with image to request
     * check connection in DBHelper which grabs actual image
     * imageUrlForRestaurant
      if (requestUrl.pathname.startsWith('/img/')) {
        event.respondWith(servePhoto(event.request));
        return;
      }
     */

});



// remove old cache if version changes
self.addEventListener("activate", function(event) {
  event.waitUntil(
    // .keys - array of all caches created by our app
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        // create an array of promises to pass to .all
        // by using .map to create a promise for each cache name
        // all promises (deletes) must pass success for Promise.all to succeed
        cacheNames.map(function(cacheName) {
          if (cacheName !== RRV_CACHE && cacheName.startsWith("rest-review-cache-")) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});




