window.models = window.models || {};
window.models.Table = Backbone.Model.extend({
  initialize: function (config) {
    console.log('new models.Table()');
    if (config && config.name) {
      app.model.execute({
        sql: 'SELECT sql FROM sqlite_master WHERE tbl_name = \'' + config.name + '\';',
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
    	app.model.execute({
    		sql: 'SELECT rowid, * FROM ' + config.name + ';',
    		success: (function (transaction, results) {
          this.set('rows', results.rows);
          if (config.ready) config.ready();
        }).bind(this)
    	});
    }
  },
  create: function (callback) {
  	console.log('models.Table.create()', this, this.toJSON());
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
  		app.model.execute({sql: sql, success: callback});
  		return sql;
  	}
  },
  defaults: {
      name: '',
      columns: [],
      rows: []
  }
});