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

class DBHelper {

  /*
   * Database URL to retrieve all restaurants
   */
  static get ALL_RESTAURANTS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /*
   * Database URL to restaurant by id
   */
  static get RESTAURANTS_BYID_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/${id}`;
  }


  /*
   * test to see if all the restuarants are already stored
   *
  static checkForAllRestaurants() {
    if (allRestaurants) {
      console.log('true ', allRestaurants);
      return true;
    }
    else {
      console.log('false ', allRestaurants);
      return false;
    }
  }

  /*
   * return specific restaurant if available
   *
  static findRestaurantByID(id) {
    return allRestaurants.find(r => r.id == id);
  }
*/

  /*
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
        /* duplicate code
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        fetchedNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        */
        callback(null, restaurantNeighborhoods);
      }
    });
  }

  /* ORIGINAL CODE
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }
  */


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
        /* duplicate code
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        fetchedCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        */
        callback(null, restaurantCuisines);
      }
    });
  }

  /* ORIGINAL CODE
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }
  */

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

window.DBHelper = DBHelper;