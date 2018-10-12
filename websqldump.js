/*
 * websqldump.js v1.0.0
 * Copyright 2016 Steven de Salas
 * http://github.com/sdesalas/websqldump
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function(window, undefined) {
  var wd = {};

  // Default config
  wd.config = {
    database: undefined,
    view: undefined, // Treated similarly to table. Added for sake of parity.
    views: [], // true to export all views
    table: undefined, // If not undefined, will be appended to tables array (left for backwards-compatibility)
    tables: [], // undefined to export all tables
    casesensitive: true,
    version: "1",
    info: "",
    dbsize: 5 * 1024 * 1024, // 5MB
    schemaonly: false,
    dataonly: false, // If true, views will NOT be exported
    success: function(sql) {
      console.log(sql);
    },
    error: function(message) {
      throw new Error(message);
    }
  };

  wd.exportViewOrTable = function(config, name, type) {
    // Use closure to avoid overwrites
    // Export schema/table schema
    if (!config.dataonly || type !== "table") {
      wd.execute({
        db: config.db,
        sql: `SELECT sql FROM sqlite_master WHERE type='${type}' AND tbl_name=?;`,
        params: [name],
        success: function(results) {
          if (!results.rows || !results.rows.length) {
            if (typeof config.error === "function")
              config.error("No such table: " + table);
            return;
          }
          config.exportSql.push(results.rows.item(0)["sql"]);
          if (config.schemaonly || type === "view") {
            if (typeof config.success === "function") {
              config.success(config.exportSql);
            }
            return;
          }
        }
      });
    }

    // Export data
    if (!config.schemaonly && type === "table") {
      wd.execute({
        db: config.db,
        sql: "SELECT * FROM '" + name + "';",
        success: function(results) {
          if (results.rows && results.rows.length) {
            for (var i = 0; i < results.rows.length; i++) {
              var row = results.rows.item(i);
              var _fields = [];
              var _values = [];
              for (var col in row) {
                _fields.push(col);
                _values.push('"' + row[col] + '"');
              }
              config.exportSql.push(
                "INSERT INTO " +
                  table +
                  "(" +
                  _fields.join(",") +
                  ") VALUES (" +
                  _values.join(",") +
                  ")"
              );
            }
          }
          if (typeof config.success === "function")
            config.success(config.exportSql.toString());
        },
        error: function(err) {
          if (typeof config.error === "function") config.error(err);
        }
      });
    }
  };

  wd.export = function(config) {
    // Apply defaults
    for (var prop in wd.config) {
      if (typeof config[prop] === "undefined") config[prop] = wd.config[prop];
    }
    if (config.table) {
      config.tables.push(config.table);
    }
    if (config.view) {
      config.views.push(config.view);
    }

    if (!config.casesensitive) {
      config.tables = config.tables.map(name => name.toLowerCase());
      config.views = config.views.map(name => name.toLowerCase());
    }

    config.db = wd.open(config);
    config.exportSql = config.exportSql || [];

    var success = config.success;
    config.success = function() {
      config.exported++;
      // Check if its all done
      if (config.exported >= config.outstanding.length) {
        if (typeof success === "function") {
          success(config.exportSql);
        }
      }
    };

    // Export all tables in db
    wd.execute({
      db: config.db,
      sql: `
        SELECT type, tbl_name FROM sqlite_master WHERE type='table'
        UNION
        SELECT type, tbl_name FROM sqlite_master WHERE type='view'
        ;
      `,
      success: function(results) {
        if (results.rows) {
          config.exported = 0; // count of exported tables/views
          config.outstanding = []; // list of outstanding tables/views
          // First count the outstanding tables
          for (let i = 0; i < results.rows.length; i++) {
            var tbl_name = results.rows.item(i)["tbl_name"];
            // skip webkit internals
            if (tbl_name.indexOf("__WebKit") !== 0) {
              const name = config.casesensitive
                ? tbl_name
                : tbl_name.toLowerCase();
              const isInWhitelist =
                (results.rows.item(i)["type"] === "view" &&
                  (!config.views.length || config.views.includes(name))) ||
                (results.rows.item(i)["type"] === "table" &&
                  (!config.tables.length || config.tables.includes(name)));

              if (isInWhitelist) {
                config.outstanding.push({
                  name: name,
                  type: results.rows.item(i)["type"]
                });
              }
            }
          }
          // Then export them
          for (let i = 0; i < config.outstanding.length; i++) {
            if (config.outstanding[i].type === "table") {
              wd.exportViewOrTable(
                config,
                config.outstanding[i].name,
                config.outstanding[i].type
              );
            } else if (!config.dataonly) {
              // It is assumed that views do not include any new information
              wd.exportViewOrTable(
                config,
                config.outstanding[i].name,
                config.outstanding[i].type
              );
            }
          }
        }
      },
      error: function(err) {
        if (typeof error === "function") error(transaction, err);
      }
    });
  };

  wd.open = function(config) {
    if (!config) throw new Error("Please use a config object");
    if (!config.database) {
      throw new Error("Please define a config database name.");
    }
    return window.openDatabase(
      config.database,
      config.version || "1.0",
      config.info || "",
      config.dbsize || 512000
    );
  };

  // Helper method for executing SQL code in DB
  wd.execute = function(config) {
    if (!config) throw new Error("Please use a config object");
    if (!config.db) {
      throw new Error("Please define a db obj to execute against");
    }
    if (!config.sql) throw new Error("Please define some sql to execute.");
    config.db.transaction(function(transaction) {
      transaction.executeSql(
        config.sql,
        config.params || [],
        function(transaction, results) {
          if (typeof config.success === "function") config.success(results);
        },
        function(transaction, err) {
          if (typeof config.error === "function") config.error(err);
        }
      );
    });
  };

  window.websqldump = {
    export: function() {
      wd.export.apply(wd, arguments);
    }
  };
})(this);
