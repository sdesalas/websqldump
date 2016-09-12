window.models = window.models || {};
window.models.Table = Backbone.Model.extend({
  initialize: function (config) {
    console.log('new models.Table()');
    if (config && config.name && config.db) {
      this.name = config.name;
      this.db = config.db;
      this.db.execute({
        sql: 'SELECT sql FROM sqlite_master WHERE tbl_name = \'' + this.name + '\';',
        success: (function (transaction, results) {
          if (results.rows[0]) {
            // e.g. "CREATE TABLE Orders (ID INTEGER NOT NULL PRIMARY KEY,Product TEXT NULL )"
            var cols = [], sql = results.rows[0].sql;
            sql.split('(').pop().split(',').forEach(function(info, i) {
              info = info.trim().split(' ');
              var col = { 
                name: info.shift(),
                dataType: info.shift(),
                nullable: info.join(' ').indexOf('NOT NULL') === -1,
                primaryKey: info.join(' ').indexOf('PRIMARY KEY') > -1
              };
              cols.push(col);
            });
            this.set('sql', sql);
            this.set('cols', cols);
          }
        }).bind(this)
      });
      this.refresh(config.ready);
    }
  },
  refresh: function (callback) {
      this.db.execute({
        sql: 'SELECT rowid as _rowid, * FROM ' + this.name + ';',
        success: (function (transaction, results) {
          this.set('rows', results.rows);
          if (callback) callback();
        }).bind(this)
      });
  },
  insert: function (row, callback) {
    console.log('models.Table.insert()');
    if (row) {
      var fields = Object.keys(row),
          values = fields.map(function(key) {return '\'' + row[key] + '\'';});
      this.db.execute({
          sql: "INSERT INTO " + this.name + " (" + fields.join(",") + ") VALUES (" + values.join(",") + ");",
          success: callback
        });
    }
  },
  delete: function (rowid, callback) {
    console.log('models.Table.delete()');
    if (typeof rowid !== 'undefined') {
      this.db.execute({
          sql: "DELETE FROM " + this.name + " WHERE rowid = ?;",
          params: [rowid],
          success: callback
        });
    }
  },
  create: function (callback) {
  	console.log('models.Table.create()');
  	var sql, name = this.get('name') || '',
  		columns = this.get('columns') || [];
  	if (!columns.length) {
  		alert("Please add at least one column.");
  		return;
  	}
  	if (name.indexOf(" ") > -1) {
  		alert("Please make sure there are no spaces in the table name");
  		return;
  	}
  	if (confirm("Are you sure you want to create table [" + name + "]?")) {
  		sql = "CREATE TABLE " + name + " (";
  		sql += columns.map(function(column) {
  			return column.name + ' ' + column.dataType + ' ' + column.nullable + ' ' + column.primaryKey; 
  		}).join(',');
  		sql += ");";
  		console.log(sql);
  		this.db.execute({sql: sql, success: callback});
  		return sql;
  	}
  },
  defaults: {
      name: '',
      columns: [],
      rows: []
  }
});