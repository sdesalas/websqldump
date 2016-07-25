/*  
 * HTML5 SQL CLIENT 
 * 
 * By: Steven de Salas
 * On: November 2010
 * 
 * This is a tiny HTML5 SQL Client written in Javascript
 * 
 * You are free to use this code by quoting its original source 
 * 
 */

// Define Client as Singleton
SqlClient = {};

// Intialize
SqlClient.init = function() {
	// Add shortcuts
	$get = SqlClient.get;
	$getTags = SqlClient.getTags;
	$log = SqlClient.log;
	$load = SqlClient.load;
	$beforeunload = SqlClient.beforeunload;
	$connect = SqlClient.connect;
	$navigate = SqlClient.navigate;
	$changeDb = SqlClient.changeDb;
	$viewTable = SqlClient.viewTable;
	$addTable = SqlClient.addTable;
	$addColumn = SqlClient.addColumn;
	$insertRecord = SqlClient.insertRecord;
	$deleteRecord = SqlClient.deleteRecord;
	$truncate = SqlClient.truncate;
	$dropTable = SqlClient.dropTable;
	$execute = SqlClient.execute;
	$executeSql = SqlClient.executeSql;
	$exportTable = SqlClient.exportTable;
	$generateDump = SqlClient.generateDump;
	$toggleDump = SqlClient.toggleDump;
	$executeDump = SqlClient.executeDump;
	// Event listeners
	$focus = function(obj) {if (!obj.oldvalue || obj.oldvalue == obj.value) {obj.oldvalue = obj.value; obj.value = '';}};
	$blur = function(obj) {if (!obj.value) obj.value = obj.oldvalue;;};
	// Commence
	$load(function() {
		SqlClient.dbInit = {
			dbName: "WebSQLDumpTest",
			dbVer: "1.0",
			dbInfo: "",
			dbSize: 512000
		};
		$navigate("main");
	});
};

// Add queuing functionality for window.onload
SqlClient.load = function(fn) {
	$log("SqlClient.load(fn)", fn);
	if (typeof fn == "function") {
		if (!window._onload) {
			window._onload = window.onload;
			window.onload = function() {
				if (SqlClient.load.queue) {
					for (var i = 0; i < SqlClient.load.queue.length; i++) {
						SqlClient.load.queue[i]();	
					}
				}
				if (typeof window._onload == "function") window._onload();	
				window._onload = null;
			};	
		}
		if (!SqlClient.load.queue) SqlClient.load.queue = [fn];
		else SqlClient.load.queue.push(fn);
	}
};

// Add queuing functionality for window.onbeforeunload
SqlClient.beforeunload = function(fn) {
	$log("SqlClient.beforeunload(fn)", fn);
	if (typeof fn == "function") {
		if (!window._onbeforeunload) {
			window._onbeforeunload = window.onbeforeunload;
			window.onbeforeunload = function() {
				if (SqlClient.beforeunload.queue) {
					for (var i = 0; i < SqlClient.beforeunload.queue.length; i++) {
						SqlClient.beforeunload.queue[i]();	
					}
				}
				if (typeof window._onbeforeunload == "function") window._onbeforeunload();	
				window._onbeforeunload = null;
			};	
		}
		if (!SqlClient.beforeunload.queue) SqlClient.beforeunload.queue = [fn];
		else SqlClient.beforeunload.queue.push(fn);
	}
};


// Get DOM element
SqlClient.get = function(id) {
	$log("SqlClient.get(id)", id);
	return document.getElementById(id);
};

// Get DOM element
SqlClient.getTags = function() {
	$log("SqlClient.getAll()", arguments);
	var _tags = [];
	if (arguments && arguments.length) {
		for(var i = 0; i < arguments.length; i++) {
			var _nodes = document.getElementsByTagName(arguments[i]);
			for(var j = 0; j <_nodes.length; j++) {
				_tags.push(_nodes[j]);
			}
		}
	}
	return _tags;
};


// Show section
SqlClient.show = function(section, args) {
	$log("SqlClient.show(section, args)", section, args);
	var _body = $get("content");
	var _content = $get(section);
	if (_body && _content) {
		var _html = _content.innerHTML;
		if (args && args.length) {
			for (var i = 0; i < args.length; i++) {
				_html = _html.replace(eval("/\\{" + i + "\\}/gi"), args[i]);
			}
		}
		_body.innerHTML = _html;
	};	
}

// Debug tools
SqlClient.isDebug = true;
SqlClient.log = function() {
  if (SqlClient.isDebug && arguments.length && typeof(console) != "undefined") {
    try {
      // Single parameter? pass it to console
      if (arguments.length == 1) console.log(arguments[0])
      // Multiple parameters? output raw arguments array to the console
      else console.log(arguments);
    } catch (e) {}
  }
};

// Open DB Connection
SqlClient.connect = function(){
	$log("SqlClient.connect()");
	try {
		SqlClient.db = window.openDatabase(SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.dbInit.dbInfo, SqlClient.dbInit.dbSize);
	} catch (e) {
		$log(e);
		SqlClient.show("dbError", [e]);
	}
};

// Point connection to another DB
SqlClient.changeDb = function(obj){
	$log("SqlClient.changeDb()");
	if (obj && obj.value) {
		SqlClient.dbInit.dbName = obj.value;
		$connect;
		$navigate("openDb");
	}
};

// Add table to DB
SqlClient.addTable = function() {
	$log("SqlClient.addTable()");
	if (SqlClient.db != null) {
		if (!SqlClient.currentTable) SqlClient.currentTable = {};
		if (!SqlClient.currentTable.columns) SqlClient.currentTable.columns = [];
		var _tblName;
		var _nodes = $getTags("input");
		for (var i = 0; i < _nodes.length; i++) {
			if (_nodes[i].name == "tblName") _tblName = _nodes[i].value;
		}
		if (_tblName) {
			if (!SqlClient.currentTable.columns.length) {
				alert("Please add at least one column.");
				return;
			}
			if (_tblName.indexOf(" ") > -1) {
				alert("Please make sure there are no spaces in the table name");
				return;
			}
			if (confirm("Are you sure you want to create table [" + _tblName + "]?")) {
				var _sql = "CREATE TABLE " + _tblName + " (";
				for (var i = 0; i < SqlClient.currentTable.columns.length; i++) {
					var _col = SqlClient.currentTable.columns[i];
					_sql += _col.colName + " " + _col.colType + " " + _col.colNull + " " + _col.colPk + ", ";
				}
				// Remove the last comma
				_sql = _sql.substr(0, _sql.length - 2);
				_sql += ");";
				$log(_sql);
				// SQL: Create table
				$execute(_sql, []);
			}
		}
	}
};

// View table by name
SqlClient.viewTable = function(name){
	$log("SqlClient.viewTable()");
	if (SqlClient.db != null) {
		if (!SqlClient.currentTable) SqlClient.currentTable = {};
		SqlClient.currentTable.name = name;
		$navigate("viewTable");
	}
};

// Add column to current table
SqlClient.addColumn = function() {
	$log("SqlClient.addColumn()");
	if (SqlClient.db != null) {
		if (!SqlClient.currentTable) SqlClient.currentTable = {};
		if (!SqlClient.currentTable.columns) SqlClient.currentTable.columns = [];
		var _colName = "ColumnName";
		var _colType = "TEXT";
		var _colNull = "NULL";
		var _colPk = "";
		var _nodes = $getTags("input", "select");
		for (var i = 0; i < _nodes.length; i++) {
			if (_nodes[i].name == "colName") _colName = _nodes[i].value;
			if (_nodes[i].name == "colType") _colType = _nodes[i].childNodes[_nodes[i].selectedIndex].value;
			if (_nodes[i].name == "colNull" && _nodes[i].checked) _colNull = (_nodes[i].value == "Yes") ? "NULL" : "NOT NULL";
			if (_nodes[i].name == "colPk" && _nodes[i].checked) _colPk = (_nodes[i].value == "Yes") ? "PRIMARY KEY" : "";
		};
		if (_colName.indexOf(" ") > -1) {
			alert("Please make sure there are no spaces in the column name");
			return;
		}
		for (var i = 0; i < SqlClient.currentTable.columns.length; i++) {
			if (SqlClient.currentTable.columns[i].colName == _colName) {
				alert("The Column [" + _colName + "] already exists. Please choose another name.");
				return;
			}
		}
		var _column = {
			colName: _colName,
			colType: _colType,
			colNull: _colNull,
			colPk: _colPk
		};
		$log("adding _column", _column);
		SqlClient.currentTable.columns.push(_column);
		// Show column on interface
		var _list = $get("column-list");
		if (_list) {
			var _html = "";
			for (var i = 0; i < SqlClient.currentTable.columns.length; i++) {
				var _col = SqlClient.currentTable.columns[i];
				_html += "<li><b>" + _col.colName + "</b> (" + _col.colType + " " + _col.colNull + " " + _col.colPk + ")</li>";
			}
			_list.innerHTML = _html;
		}
		// Reset fields
		$get("colName").value= $get("colName").oldvalue;
		$get("colType").selectedIndex = 0;
		$get("colNull-1").checked = true;
		$get("colPk-2").checked = true;
	}
};

// Insert record into current table
SqlClient.insertRecord = function(name){
	$log("SqlClient.insertRecord()");
	if (SqlClient.db != null && SqlClient.currentTable && SqlClient.currentTable.name) {
		var _tags = $getTags("input");
		var _fields = [];
		var _values = [];
		var _allBlank = true;
		for (var i = 0; i < _tags.length; i++) {
			var _tag = _tags[i];
			if (_tag.name.match(/^col-/)) {
				_fields.push(_tag.name.replace(/^col-/, ""));
				_values.push("'" + _tag.value + "'");
				if (_tag.value != "") _allBlank = false;
			};
		}
		if (_allBlank && !confirm("Are you sure you want to enter a blank record?")) 
			return;
		else {
			$execute("INSERT INTO " + SqlClient.currentTable.name + " (" + _fields.join(",") + ") VALUES (" + _values.join(",") + ");", [], 
			function(){
				$viewTable(SqlClient.currentTable.name);
			});
		}
	}
};

// Delete record from current table
SqlClient.deleteRecord = function(rowid) {
	$log("SqlClient.deleteRecord(rowid)", rowid);
	if (SqlClient.db != null && rowid != null && SqlClient.currentTable && SqlClient.currentTable.name) {
		$execute("DELETE FROM " + SqlClient.currentTable.name + " WHERE rowid = '" + rowid + "';", [], 
		function(){
			$viewTable(SqlClient.currentTable.name);
		});
	}
};

// Delete all records (and reset primary key) in current table
SqlClient.truncate = function() {
	$log("SqlClient.truncate()");
	if (SqlClient.db != null && SqlClient.currentTable && SqlClient.currentTable.name) {
		if (confirm("Delete all records?")) {
			$execute("DELETE FROM " + SqlClient.currentTable.name + ";", [], function(){
				$viewTable(SqlClient.currentTable.name);
			});
		}
	}
};

// Drop current table
SqlClient.dropTable = function() {
	$log("SqlClient.dropTable()");
	if (SqlClient.db != null && SqlClient.currentTable && SqlClient.currentTable.name) {
		if (confirm("Delete Table \"" + SqlClient.currentTable.name + "\"?")) {
			$execute("DROP TABLE " + SqlClient.currentTable.name + ";", []);
		}
	}
};

//  Export current table as SQL script
SqlClient.exportTable = function() {
	$log("SqlClient.exportTable()");
	if (SqlClient.db != null && SqlClient.currentTable && SqlClient.currentTable.name) {
			$execute("SELECT sql FROM sqlite_master WHERE tbl_name='" + SqlClient.currentTable.name + "';", [], 
				function(transaction, results) {
					if (results.rows && results.rows.item(0)) {
						var _exportSql = results.rows.item(0)["sql"];
						$execute("SELECT * FROM " + SqlClient.currentTable.name + ";", [], 
							function(transaction, results) {
								if (results.rows) {
									for (var i = 0; i < results.rows.length; i++) {
										var row = results.rows.item(i);
										var _fields = [];
										var _values = [];
										for (col in row) {
											_fields.push(col);
											_values.push('"' + row[col] + '"');
										}
										_exportSql += ";\nINSERT INTO " + SqlClient.currentTable.name + "(" + _fields.join(",") + ") VALUES (" + _values.join(",") + ")";
									}
								}
								SqlClient.show('exportTable', [SqlClient.currentTable.name, _exportSql + ";"]);
							}
						);
					}
				}
			);
	}
};

SqlClient.generateDump = function() {
	$log("SqlClient.generateDump()");
	SqlClient.generateDump.table = undefined;
	SqlClient.generateDump.options = [];
	$navigate('generateDump');
};

SqlClient.toggleDump = function(type, name) {
	$log("SqlClient.toggleDump('"+ type + "', '" + name + "')");
	var table = SqlClient.generateDump.table;
	var options = SqlClient.generateDump.options;
	switch(type) {
		case 'table':
			table = name;
			break;
		case 'option':
			if (options.indexOf(name) > -1) options.splice(options.indexOf(name), 1);
			else options.push(name);
		break;
	}
	var exportOptions = {
		database: SqlClient.dbInit.dbName,
		success: "{{success}}",
		table: table
	};
	options.forEach(function(opt) {
		exportOptions[opt] = true;
	});
	var optionsStr = JSON.stringify(exportOptions, null, 2).replace('\"{{success}}\"', "function(sql) {\n    var output = document.getElementById('websqldumpOutput');\n   output.value = sql;\n  }")
	var result = "websqldump.export(" + optionsStr + ");";
	var websqldumpCode = $get('websqldumpCode');
	if (websqldumpCode) websqldumpCode.value = result;
	return result;
};

SqlClient.executeDump = function() {
	$log("SqlClient.executeDump()");
	var code = $get('websqldumpCode').value;
	var func = new Function(code);
	func.call();
};

// Helper method for executing SQL code in DB
SqlClient.execute = function(sql, params, callback) {
	$log("SqlClient.execute(sql, params)", sql);
	if (SqlClient.db != null) {
		SqlClient.db.transaction(function(transaction){
			SqlClient.currentQuery = sql;
			transaction.executeSql(SqlClient.currentQuery, params,
				function(transaction, results) {
					if (typeof(callback) == "function") callback(transaction, results);
					else 	SqlClient.navigate("openDb");
				}, 
				function(transaction, error) {
					$log(error);
					SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
				}
			);
		});
	}
};

// Execute arbitrary SQL (entered by user) on the database
SqlClient.executeSql = function() {
	$log("SqlClient.executeSql()");
	var _sqlQuery = $get("sqlQuery");
	if (SqlClient.db != null && _sqlQuery.value) {
		SqlClient.db.transaction(function(transaction){
			SqlClient.currentQuery = _sqlQuery.value;
			transaction.executeSql(SqlClient.currentQuery, [],
				function(transaction, results) {
					var _data;
					if (results.rows.length) {
						_data = "<ul>";
						for (var i = 0; i < results.rows.length; i++) {
							var row = results.rows.item(i);
							_data += "<li>";
							for (col in row) 
								_data += "<label>" + col + ":</label> " + row[col] + "<br/>";
							_data += "</li>";
						}
						_data += "</ul>";
					}
					else 
						_data = "<ul><li>No records returned.</li></ul>";
					SqlClient.show("executeSqlResults", [SqlClient.dbInit.dbName, SqlClient.currentQuery, results.rowsAffected + " rows affected.", _data]);
				}, 
				function(transaction, error) {
					$log(error);
					SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
				}
			);
		});
	}
};

// Navigation
SqlClient.navigate = function(section) {
	$log("SqlClient.navigate(section)", section);
	switch(section) {
		case 'viewTable':
			$connect();
			SqlClient.db.transaction(function(transaction){
				// SQL: Show Records
				SqlClient.currentQuery = "SELECT rowid, * FROM " + SqlClient.currentTable.name + ";";
				transaction.executeSql(SqlClient.currentQuery, [],  
				function(transaction, results){
					if (results.rows.length) {
						var _data = "<ul>";
						for (var i = 0; i < results.rows.length; i++) {
							// Each row is a standard JavaScript array indexed by column names.
							var row = results.rows.item(i);
							_data += "<li>";
							var _id = null;
							var _idField = null;
							for (col in row) {
								var _origIdField = _idField;
								if (_id == null) {
									_id = row[col];
									_idField = col;
									_data += "<a href='javascript:$deleteRecord(" + _id + ");' class='delete'></a>";
								}
								// Fix for Opera which has a bug allowing multiple fields with same name in resultset.
								if (col != _origIdField)
									_data += "<label>" + col + ":</label> " + row[col] + "<br/>";
							}
							_data += "</li>";
						}
						_data += "</ul>";
					}
					else 
						_data = "<ul><li>This table has no records.</li></ul>";
					SqlClient.show("viewTable", [SqlClient.currentTable.name, _data, "<div id='addRecord'></div>"]);
					// SQL: Add a new Record into table
					SqlClient.currentQuery = "SELECT sql FROM sqlite_master WHERE tbl_name = '" + SqlClient.currentTable.name + "';";
					transaction.executeSql(SqlClient.currentQuery, [],  
					function(transaction, results2){
						$log("results2", results2);
						var _item = results2.rows.item(0);
						if (_item && _item.sql) {
							var _data2 = "<h2>Add To Table</h2><ul>";
							var _cols = _item.sql.split("(")[1].split(",");
							for( var i = 0; i < _cols.length;i++) {
								var _col = _cols[i];
								if (_col.indexOf(" ") == 0) _col = _col.substr(1, _col.length - 1);
								_col = _col.substr(0, _col.indexOf(" "));
								_data2 += "<li><label>" + _col + ":</label><input name='col-" + _col + "' type='text' /></li>";
							}
							_data2 += "</ul><a href=\"javascript:$insertRecord();\" class=\"button\">Insert Record</a>";
							$get("addRecord").innerHTML = _data2;
						}
					},  
					function(transaction, error){
						$log(error);
						SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
					});
				},  
				function(transaction, error){
					$log(error);
					SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
				});
			});
			break;
		case 'addTable':
			SqlClient.currentTable = null;
			SqlClient.show("addTable", ["tblName", "column-list", "colName", "colType", "colNull", "colPk"]);
			break;
		case 'openDb':
			$connect();
			SqlClient.db.transaction(function(transaction) {
				// SQL: Show Tables in Database
				SqlClient.currentQuery = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;";
				transaction.executeSql(SqlClient.currentQuery, [],
					function(transaction, results) {
						if (results.rows.length) {
							var _tables = "<ul>";
							 for (var i=0; i<results.rows.length; i++) {
							      // Each row is a standard JavaScript array indexed by column names.
							      var row = results.rows.item(i);
								  if (row['name'] != "__WebKitDatabaseInfoTable__")
							      	_tables += "<li><a class='block' href='javascript:$viewTable(\"" + row['name'] + "\")'>" + row['name'] + "</a></li>";
							}
							_tables += "</ul>";
						} 
						if (!_tables || _tables == "<ul></ul>") 
							_tables = "<ul><li>There are no tables in the database.</li></ul>";
						SqlClient.show("openDb", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, _tables, "sqlQuery"]);
					}, 
					function(transaction, error) {
						$log(error);
						SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
					}
				);
			});
			break;
		case 'generateDump':
			$connect();
			SqlClient.db.transaction(function(transaction) {
				// SQL: Show Tables in Database
				SqlClient.currentQuery = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;";
				transaction.executeSql(SqlClient.currentQuery, [],
					function(transaction, results) {
						if (results.rows.length) {
							var _tables = "<ul>";
							 for (var i=0; i<results.rows.length; i++) {
							      // Each row is a standard JavaScript array indexed by column names.
							      var row = results.rows.item(i);
								  if (row['name'] != "__WebKitDatabaseInfoTable__")
							      	_tables += "<li><input type='radio' name='table' id='" + row['name'] + "' onchange='$toggleDump(\"table\", this.id)' style='float: right;'><a class='block' href='javascript:$toggleDump(\"table\", \"" + row['name'] + "\")' style='width:90%'>" + row['name'] + "</a></li>";
							}
							_tables += "</ul>";
						} 
						if (!_tables || _tables == "<ul></ul>") 
							_tables = "<ul><li>There are no tables in the database.</li></ul>";
						SqlClient.show("generateDump", [_tables, $toggleDump()]);
					}, 
					function(transaction, error) {
						$log(error);
						SqlClient.show("tblError", [SqlClient.dbInit.dbName, SqlClient.dbInit.dbVer, SqlClient.currentQuery, error.message]);
					}
				);
			});
			break;
		default:
			if (typeof (window.openDatabase) != "undefined")
				$navigate("openDb");
			else 
				SqlClient.show("main", 
					[
						navigator.userAgent, 
						"red",
						"disabled",
						"Sorry!",
						"<p>Your browser <b>does not support</b> HTML5 Databases, please try one of the following: </p><br/><a href='http://www.google.com/chrome' class='button'>Download Chrome</a><a href='http://www.apple.com/safari/download/' class='button'>Download Safari</a><a href='http://www.opera.com/download/' class='button'>Download Opera</a>"
					]
				)
	};	
};

// Intialize
SqlClient.init();


