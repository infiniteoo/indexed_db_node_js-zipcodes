/* eslint-disable quotes */
function withDB (callback) {
  const request = indexedDB.open("zipcodes", 1) // Request v1 of the database
  request.onerror = console.error // Log any errors
  request.onsuccess = () => {
    // Or call this when done
    const db = request.result // The result of the request is the database
    callback(db) // Invoke the callback with the database
  }

  // If version 1 of the database does not yet exist, then this event
  // handler will be triggered. This is used to create and initialize
  // object stores and indexes when the DB is first created or to modify
  // them when we switch from one version of the DB schema to another.
  request.onupgradeneeded = () => {
    initdb(request.result, callback)
  }
}

// withDB() calls this function if the database has not been initialized yet.
// We set up the database and populate it with data, then pass the database to
// the callback function.
//
// Our zip code database includes one object store that holds objects like this:
//
//   {
//     zipcode: "02134",
//     city: "Allston",
//     state: "MA",
//   }
//
// We use the "zipcode" property as the database key and create an index for
// the city name.
function initdb (db, callback) {
  console.log("made it to initdb")
  // Create the object store, specifying a name for the store and
  // an options object that includes the "key path" specifying the
  // property name of the key field for this store.
  const store = db.createObjectStore(
    "zipcodes", // store name
    { keyPath: "zipcode" }
  )

  // Now index the object store by city name as well as by zip code.
  // With this method the key path string is passed directly as a
  // required argument rather than as part of an options object.
  store.createIndex("cities", "city")

  // Now get the data we are going to initialize the database with.
  // The zipcodes.json data file was generated from CC-licensed data from
  // www.geonames.org: https://download.geonames.org/export/zip/US.zip
  fetch("../data/zipcodes.json") // Make an HTTP GET request
    .then((response) => {
      return response.json()
    }) // Parse the body as JSON
    .then((zipcodes) => {
      // Get 40K zip code records
      // In order to insert zip code data into the database we need a
      // transaction object. To create our transaction object, we need
      // to specify which object stores we'll be using (we only have
      // one) and we need to tell it that we'll be doing writes to the
      // database, not just reads:
      console.log("zipcodes", zipcodes)
      const transaction = db.transaction(["zipcodes"], "readwrite")
      transaction.onerror = console.error

      // Get our object store from the transaction
      const store = transaction.objectStore("zipcodes")

      // The best part about the IndexedDB API is that object stores
      // are *really* simple. Here's how we add (or update) our records:
      for (const record of zipcodes) {
        store.put(record)
      }

      // When the transaction completes successfully, the database
      // is initialized and ready for use, so we can call the
      // callback function that was originally passed to withDB()
      transaction.oncomplete = () => {
        callback(db)
      }
    })
}

// Given a zip code, use the IndexedDB API to asynchronously look up the city
// with that zip code, and pass it to the specified callback, or pass null if
// no city is found.
function lookupCity (zip, callback) {
  withDB((db) => {
    // Create a read-only transaction object for this query. The
    // argument is an array of object stores we will need to use.
    const transaction = db.transaction(["zipcodes"])

    // Get the object store from the transaction
    const zipcodes = transaction.objectStore("zipcodes")

    // Now request the object that matches the specified zipcode key.
    // The lines above were synchronous, but this one is async.
    const request = zipcodes.get(zip)
    request.onerror = console.error // Log errors
    request.onsuccess = () => {
      // Or call this function on success
      const record = request.result // This is the query result
      if (record) {
        // If we found a match, pass it to the callback
        callback(`${record.city}, ${record.state}`)
      } else {
        // Otherwise, tell the callback that we failed
        callback(null)
      }
    }
  })
}

// Given the name of a city, use the IndexedDB API to asynchronously
// look up all zip code records for all cities (in any state) that have
// that (case-sensitive) name.
function lookupZipcodes (city, callback) {
  withDB((db) => {
    // As above, we create a transaction and get the object store
    const transaction = db.transaction(["zipcodes"])
    const store = transaction.objectStore("zipcodes")

    // This time we also get the city index of the object store
    const index = store.index("cities")

    // Ask for all matching records in the index with the specified
    // city name, and when we get them we pass them to the callback.
    // If we expected more results, we might use openCursor() instead.
    const request = index.getAll(city)
    request.onerror = console.error
    request.onsuccess = () => {
      callback(request.result)
    }
  })
}

function getAll (callback) {
  withDB((db) => {
    const transaction = db.transaction(["zipcodes"])
    const store = transaction.objectStore("zipcodes")

    const index = store.index("cities")

    const request = index.getAll()
    request.onerror = console.error
    request.onsuccess = () => {
      callback(request.result)
    }
  })
}

window.addEventListener("load", () => {
  const zipcodeInput = document.querySelector("#zipcodeInput")
  const cityOutput = document.querySelector("#cityOutput")
  const getAllButton = document.querySelector("#getAllButton")

  $(getAllButton).on('click', function () {
    getAll((callback) => {
      console.log(callback)
    })
  })

  zipcodeInput.onchange = () => {
    lookupCity(zipcodeInput.value, (city) => {
      cityOutput.value = city || "Unknown zip code"
    })
  }

  const cityInput = document.querySelector("#cityInput")
  const zipcodesOutput = document.querySelector("#zipcodesOutput")
  cityInput.onchange = () => {
    zipcodesOutput.textContent = "Matching zipcodes:"
    lookupZipcodes(cityInput.value, (zipcodes) => {
      zipcodes.forEach((zip) => {
        const item = document.createElement("li")
        item.append(`${zip.zipcode}: ${zip.city}, ${zip.state}`)
        zipcodesOutput.append(item)
      })
    })
  }
})
