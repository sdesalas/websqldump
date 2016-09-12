window.models = window.models || {};
window.models.Database = Backbone.Model.extend({
  initialize: function (config) {
    console.log('new Database()');
  },
  defaults: {
      name: 'WebSQLDump',
      version: '1.0',
      info: '',
      size: 512000
  },
  refresh: function(callback) {
	this.execute({
		sql: 'SELECT name FROM sqlite_master WHERE type="table" AND name NOT LIKE "__webkit%" ORDER BY name;',
		success: (function(transaction, results) {
			var tables = [];
			if (results && results.rows.length) {
				tables = results.rows.map(function(row) { return row['name'] });
			}
			this.set('tables', tables);
			if (callback) {
				callback();
			}
		}).bind(this)
	});
  },
  doTransaction: function(transaction) {
	try {
		var data = this.toJSON();
		this.db = this.db || window.openDatabase(data.name, data.version, data.info, data.size);
		if (this.db) this.db.transaction(transaction);
	} catch (e) {
		console.log('Error Opening Database.');
		if (this.error) {
			this.error(e);
		}
	}
  },
  execute: function(config) {
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
  }
});