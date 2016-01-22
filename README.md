# websqldump
A minimal JS library for exporting data out of WebSQL


## Usage

```
websqldump.export({
  database: 'NorthwindLite'
});
```

```
websqldump.export({
  database: 'NorthwindLite',
  dataonly: true,
  linebreaks: true,
  success: function(sql) {
    alert(sql); 
  }
});
```

### Configuration options

- config.database: Required. The name of the database to export
- config.table: The table to export, if null then all tables are exported (defaults to null)
- config.version: The version of the web database (defaults to '1.0')
- config.dbsize: The size of the database (defaults to 5MB)
- config.linebreaks: Set to true to add line-breaks (defaults to false)
- config.schemaonly: Set to true to get the schema only (defaults to false)
- config.dataonly: Set to true to get the data only (defaults to false)
- config.success: Callback with 1 parameter (sql output). If not available will output to console.
- config.error: Callback with 1 parameter (err message). If not available will throw an exception.
