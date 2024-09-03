import SQLite from 'react-native-sqlite-storage';

class LocationSQLite {
    constructor(dbName = "TripLocationDB.db", tableName = "triplocations") {
        this.dbName = dbName;
        this.tableName = tableName || "triplocations"
        this.db = null;
    }

    initializeDB() {
        return new Promise((resolve, reject) => {
            SQLite.enablePromise(true);
            SQLite.openDatabase(
                {
                    name: this.dbName,
                    location: 'default'
                },
                db => {
                    this.db = db;
                    console.log("Database opened");
                    this.createTable();
                    resolve(db)
                },
                error => { console.error(error); resolve(false) }
            );
        })

    }

    deleteCurrentTripData = (tripId) => {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject()
                return console.log("Database not initialized")
            }
            console.log('delete eventz')
            this.db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM ${this.tableName} WHERE tripId = "${tripId}"`, undefined,
                    (_, results) => resolve(results),
                    (_, error) => reject(error)
                );
            });
        });

        this.db.transaction(tx => {
            tx.executeSql()
        })
    }

    createTable() {
        if (!this.db) return console.log("Database not initialized")

        this.db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    tripId VARCHAR, 
                    latitude REAL, 
                    longitude REAL, 
                    timestamp REAL,
                    speed REAL,
                    distance REAL default 0
                )`
            );
        },
            error => { console.error("Error creating table: ", error); },
            () => { console.log("Table created successfully"); }
        );
    }

    addLocation(latitude, longitude, timestamp, tripId, distance = 0, speed = 0) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject()
                return console.log("Database not initialized")
            }

            this.db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO ${this.tableName} (latitude, longitude, timestamp,tripId,distance,speed) VALUES (?, ?, ?,?,?,?)`,
                    [latitude, longitude, timestamp, tripId, distance, speed],
                    (_, results) => resolve(results),
                    (_, error) => reject(error)
                );
            });
        });
    }

    getTripLocations(tripId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject();
                return console.log("Database not initialized");
            }

            this.db.transaction(tx => {
                tx.executeSql(
                    `SELECT latitude AS lat, longitude AS lon, timestamp AS time, speed FROM ${this.tableName} WHERE tripId = ?`,
                    [tripId],
                    (_, results) => {
                        let locations = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            locations.push(results.rows.item(i));
                        }
                        resolve(locations);
                    },
                    (_, error) => reject(error)
                );
            });
        });
    }

    getLastLocation(tripId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject()
                return console.log("Database not initialized")
            }
            this.db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM ${this.tableName} where tripId="${tripId}" ORDER BY timestamp DESC limit 1`,
                    [],
                    (_, results) => {
                        let locations = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            locations.push(results.rows.item(i));
                        }
                        resolve(locations);
                    },
                    (_, error) => reject(error)
                );
            });
        });
    }
}

export default LocationSQLite;
