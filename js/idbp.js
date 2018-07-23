/*
 * idbp.js - indexeddb using promises
 *
 * based on Tal Alter's book Building Progressive Web Apps
 * some modifications made:
 *    converted some functions to arrow functions
 *    a bit more generic than sample used in book
 *
 */

var dbVERSION = 1;
var dbNAME = 'restaurant_reviews';

var openDatabase = function() {
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

var openObjectStore = function(db, storeName, transactionMode) {
   return db.transaction(storeName, transactionMode)
            .objectStore(storeName);
};

var addToObjectStore = function(storeName, object) {
   return new Promise(function(resolve, reject) {
      openDatabase().then(function(db) {
         openObjectStore(db, storeName, "readwrite")
            .add(object).onsuccess = resolve;
      }).catch(errorMessage => {
         reject(errorMessage);
      });
   });
};

var updateInObjectStore = function(storeName, id, object) {
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

var getReviews = function() {
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

var getReviewsFromServer = function() {
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

