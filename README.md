# websqldump
An ultra-light JS library for exporting data out of WebSQL


## Usage

```
// Export to console
websqldump.export({
  database: 'NorthwindLite'
});
```

```
// Export to alert window
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

- **.database**: Required. The name of the database to export
- **.table**: The table to export, if null then all tables are exported (defaults to null)
- **.version**: The version of the web database (defaults to '1.0')
- **.dbsize**: The size of the database (defaults to 5MB)
- **.linebreaks**: Set to true to add line-breaks (defaults to false)
- **.schemaonly**: Set to true to get the schema only (defaults to false)
- **.dataonly**: Set to true to get the data only (defaults to false)
- **.success**: Callback with 1 parameter (sql output). If not available will output to console.
- **.error**: Callback with 1 parameter (err message). If not available will throw an exception.
