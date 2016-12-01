/*
* sql.js
*
* WebSQL wrapper for the browser
*
* Usage:
* 
* SQL.execute({
*   sql: 'SELECT * FROM Orders WHERE ID = ?',
*   params: [orderId],
*   success: function(transaction, results) {alert(results)},
*   error: function(transaction, error) {throw error}
* });
*
*/

(function() {
  
  var SQL = window.SQL = window.SQL || {
    name: 'WebSQLDb',
    version: '1.0',
    info: '',
    size: 512000
  };

  SQL.init = function(name) {
    return this.db = this.db || window.openDatabase(name || this.name, this.version, this.info, this.size);
  }

  SQL.getTables = function(callback) {
    this.execute({
      sql: 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "__webkit%" ORDER BY name;',
      success: (function(transaction, results) {
        var tables = [];
        if (results && results.rows.length) {
          tables = results.rows.map(function(row) { return row['name'] });
        }
        if (callback) {
          callback(tables);
        }
      }).bind(this)
    });
  };

  SQL.doTransaction = function(transaction) {
    try {
      this.init();
      if (this.db) this.db.transaction(transaction);
    } catch (e) {
      console.log('Error Opening Database.');
      if (this.error) {
        this.error(e);
      }
    }
  };

  SQL.execute = function(config) {
      if (config && config.sql) {
        var transaction = function(transaction) {
        transaction.executeSql(config.sql, config.params || [],
          function(transaction, results) {
            var rows = [];
            if (results && results.rows) {
              for (var i = 0; i < results.rows.length; i++) {
                rows.push(results.rows.item(i));
              }
            }
            if (config.success) {
              config.success(transaction, {rows: rows});
            }
          }, 
          config.error || function(transaction, error) {
            console.error('SQL Execution error: ' + error + '. While running following SQL script:\n ' + config.sql);
          }
        );
        };
        if (config.transaction) {
          config.transaction(transaction);
        } else {
          this.doTransaction(transaction);
        }
      }
  };

  SQL.executeMulti = function(config) {
    if (config && config.sql) {
      var errors = [],
        statements = config.sql
          .split(';')
          .filter(function(sql) { return sql && sql.trim(); })
          .map(function(sql) { return { sql: sql, done: false }; });
      statements.forEach(function(statement) {
        SQL.execute({
          sql: statement.sql,
          success: function(transaction, recordset) {
            statement.done = true;
            if (statements.filter(function(s) { return !s.done; }).length === 0) {
              if (errors.length) {
                if (config.error) {
                  config.error(transaction, errors[0]);
                } else {
                  throw errors[0];
                }
              } else if (config.success) {
                config.success(transaction, recordset);
              }
            }
          },
          error: function(transaction, error) {
            statement.done = true;
            errors.push(error);
          }
        });
      });
    }
  };

})();



