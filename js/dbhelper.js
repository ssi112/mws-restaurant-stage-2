/*
 * Common database helper functions.
 * curl "http://localhost:1337/restaurants"
 * curl "http://localhost:1337/restaurants/{3}"
 */

/*
 * filled by call to fetchRestaurants
 * used in select lists to filter restaurants
 */
let restaurantCuisines;
let restaurantNeighborhoods;

/*
 * holds all the restaurants
 */
let allRestaurants;

var dbVERSION = 1;
var dbNAME = 'restaurant_reviews';

const PORT = 1337;

class DBHelper {

  // Database URL to retrieve all restaurants
  static get ALL_RESTAURANTS_URL() {
    //  const port = 1337 // Change this to your server port
    return `http://localhost:${PORT}/restaurants`;
  }

  // Database URL to restaurant by id
  static get RESTAURANTS_BYID_URL() {
    return `http://localhost:${PORT}/restaurants/${id}`;
  }

  // Database URL for reviews
  static get RESTAURANT_REVIEWS() {
    const REVIEWS_URL = `http://localhost:${PORT}/reviews/`;
  }

/* -------------------------------------------------------------------------------------------
 * based on Tal Alter's book Building Progressive Web Apps
 * some modifications made:
 *    converted some functions to arrow functions
 *    a bit more generic than sample used in book
 *
 */

  static openDatabase() {
     return new Promise(function(resolve, reject) {
        // make sure IndexdDB is supported first
        if (!self.indexedDB) {
           reject("Uh oh, IndexedDB is NOT supported in this browser!");
        }
        var request = self.indexedDB.open(dbNAME, dbVERSION);
        request.onerror = event => { reject(`Database error: ${event.target.error}`) };

        request.onupgradeneeded = event => {
           var db = event.target.result;
           if (!db.objectStoreNames.contains("reviews")) {
              db.createObjectStore("reviews", {keyPath: "id"});
           }
        };
        request.onsuccess = event => {
           resolve(event.target.result);
        };
     });
  };

  static openObjectStore(db, storeName, transactionMode) {
     return db.transaction(storeName, transactionMode)
              .objectStore(storeName);
  };

  static addToObjectStore(storeName, object) {
     return new Promise(function(resolve, reject) {
        openDatabase().then(function(db) {
           openObjectStore(db, storeName, "readwrite")
              .add(object).onsuccess = resolve;
        }).catch(errorMessage => {
           reject(errorMessage);
        });
     });
  };

  static updateInObjectStore(storeName, id, object) {
     return new Promise(function(resolve, reject) {
        openDatabase().then(function(db) {
           openObjectStore(db, storeName, "readwrite")
              .openCursor().onsuccess = event => {
                 var cursor = event.target.result;
                 if (!cursor) {
                    reject("Record not founnd in object store");
                 }
                 if (cursor.value.id === id) {
                    cursor.update(object).onsuccess = resolve;
                    return;
                 }
                 cursor.continue();
              };
        }).catch( errorMessage => {
           reject(errorMessage);
        });
     });
  };

  static getReviews() {
    return new Promise(function(resolve) {
      openDatabase().then(function(db) {
        var objectStore = openObjectStore(db, "reviews");
        var reviews = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            reviews.push(cursor.value);
            cursor.continue();
          } else {
            if (reviews.length > 0) {
              resolve(reviews);
            } else {
              getReviewsFromServer().then(function(reviews) {
                openDatabase().then(function(db) {
                  var objectStore = openObjectStore(db, "reviews", "readwrite");
                  for (var i = 0; i < reviews.length; i++) {
                    objectStore.add(reviews[i]);
                  }
                  resolve(reviews);
                });
              });
            }
          }
        };
      }).catch(function() {
        getReviewsFromServer().then(function(reviews) {
          resolve(reviews);
        });
      });
    });
  };

  static getReviewsFromServer() {
    return new Promise(function(resolve) {
      if (self.$) {
        $.getJSON("/reservations.json", resolve);
      } else if (self.fetch) {
        fetch("/reservations.json").then(function(response) {
          return response.json();
        }).then(function(reviews) {
          resolve(reviews);
        });
      }
    });
  };


  /* -------------------------------------------------------------------------------------------
   * original DBHelper code follows - not fully original, has been modified to meet project
   * requirements...
   *
   * converted from xhr to fetch()
   * fill in the cuisine and neighborhood variables that are used in <select> filters
   * also put all the restaurant json data into variable for reuse (minimize calls to db)
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.ALL_RESTAURANTS_URL).then(response => {
      response.json()
        .then(restaurants => {
          if (restaurants.length) {

            // Get the neighborhoods from restaurants
            const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);

            // filter the neighborhoods
            restaurantNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

            // Get cuisines from restaurant data
            const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);

            // filter the cuisines - only unique
            restaurantCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

            // store all the restaurants for reuse
            allRestaurants = restaurants;
            // console.log('fetchRestaurants\n', allRestaurants);
          }
          callback(null, restaurants);
        });
    }).catch(error => {
      callback(`UH OH! ${error}`, null);
    });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else {
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }


  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
}

  /*
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    if (restaurantNeighborhoods) {
      // data already fetched, so just return it
      callback(null, restaurantNeighborhoods);
      return;
    }

    // Fetch all restaurants in order to prefill restaurantNeighborhoods
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, restaurantNeighborhoods);
      }
    });
  }

  /*
   * Fetch all cuisines in order to prefill restaurantCuisines
   */
    static fetchCuisines(callback) {
    if (restaurantCuisines) {
      callback(null, restaurantCuisines);
      return;
    }

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, restaurantCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    // in case record has no photograph property
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}.jpg`);
    } else {
      // default image if missing
      return ('/img/default-annie-spratt.jpg');
      // alternative is to use id - if image exists
      // return (`/img/${restaurant.id}.jpg`);
    }
  }


  /* Used for Mapbox / Leaflet */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

}

self.DBHelper = DBHelper;
