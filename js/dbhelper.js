/*
 * Common database helper functions.
 * curl "http://localhost:1337/restaurants"
 * curl "http://localhost:1337/restaurants/{3}"
 *
 * Relies on Jake Archibald's IndexedDB Promise library
 * found in js/idb.js
 *
 */


if (typeof idb === "undefined") {
  self.importScripts('js/idb.js');
}

/*
 * filled by call to getNeighborhoodsCuisinesSelect
 * used in select lists to filter restaurants
 */
var restaurantCuisines;
var restaurantNeighborhoods;

/*
 * holds all the restaurants
 */
var allRestaurants;

const dbVERSION = 1;
const dbNAME = 'restaurant_reviews';
const dbOBJECTSTORE = 'reviews';

// port for Sails dev server
const PORT = 1337;

class DBHelper {
  // Database URL.
  static get DATABASE_URL() {
    // const port = 1337 // Change this to your server port
    return `http://localhost:${PORT}/restaurants`;
  }

  /*
   * open indexedDB and upgrade if needed
   */
  static openIDB() {
    // Does the browser support service worker?
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    // make sure IndexdDB is supported
    if (!self.indexedDB) {
      reject("Uh oh, IndexedDB is NOT supported in this browser!");
    }
    return idb.open(dbNAME, dbVERSION, function(upgradeDb) {
      /*
      var store = upgradeDb.createObjectStore(dbOBJECTSTORE, { keyPath: 'id' });
      store.createIndex('restID', 'id');
      */
      switch (dbVERSION) {
        case 0:
        case 1: {
            var store = upgradeDb.createObjectStore(dbOBJECTSTORE, { keyPath: 'id' });
            store.createIndex('restID', 'id');
        }
        case 2: {
          // stage 3
        }
      } // switch
    });
  }

  /*
   * takes the data from the API (data) and stores it in IDB
   */
  static storeAllInIDB(data) {
    return DBHelper.openIDB().then(function(db) {
      if(!db) return;

      var tx = db.transaction(dbOBJECTSTORE, 'readwrite');
      var store = tx.objectStore(dbOBJECTSTORE);
      data.forEach(function(restaurant) {
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  /*
   * fetches data from API
   * then stores it in IDB
   */
  static getFromAPIsaveToIDB() {
    return fetch(DBHelper.DATABASE_URL)
      .then(function(response){
        return response.json();
    }).then(restaurants => {
      DBHelper.storeAllInIDB(restaurants);
      return restaurants;
    });
  }

  /*
   * gets all the retaurant data from IDB
   */
  static getAllFromIDB() {
    return DBHelper.openIDB().then(function(db){
      if(!db) return;

      var store = db.transaction(dbOBJECTSTORE).objectStore(dbOBJECTSTORE);
      // console.log(store); // testing
      return store.getAll();
    });
  }


  /*
   * Filters the neighborhoods and cuisines that are used in the
   * select lists on main page
   */
  static getNeighborhoodsCuisinesSelect(restaurants) {
    // Get the neighborhoods from restaurants
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);

    // filter the neighborhoods
    restaurantNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

    // Get cuisines from restaurant data
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);

    // filter the cuisines - only unique
    restaurantCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);

    // store all the restaurants for reuse if needed
    allRestaurants = restaurants;
  }


  /*
   * Fetch all restaurants either from IDB or API
   * then update vars that hold
   * cuisines and neighborhoods
   */
  static fetchRestaurants(callback) {
    return DBHelper.getAllFromIDB().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.getFromAPIsaveToIDB();
      }
    })
    .then(restaurants=> {
      DBHelper.getNeighborhoodsCuisinesSelect(restaurants);
      callback(null, restaurants);
    })
    .catch(error => {
      callback(error, null);
    })
  }

  /*
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else {
          callback(`Restaurant with ID ${id} does not exist`, null);
        }
      }
    });
  }

  /*
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
      // data already fetched, so just return it
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

  /*
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
