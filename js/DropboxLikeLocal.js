
!(function (_global, undefined){
  function dropboxDB(app_key) {

    var META_TABLE = '_dbtables';

    var ds = null
    var client = null
    setupDropbox();


    function setupDropbox(){
      client = new Dropbox.Client({key:app_key});
      client.authenticate(null, function(error) {
      if(error)
          error("Dropbox authentication error:" + error);
        else
          setupDatastore();
      });
    }

    function setupDatastore(){
      client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
        if (error) {
          error('Cannot open  default datastore, got error: ' + error);
        } else {
          ds = datastore;
        }
      });
    }

    function drop() {}

    function tableCount() {
      var list = ds.listTableIds()
      return list.length;
    };

    function tableFields(table_name) {}

    function tableExists(table_name) {}

    function tableExistsWarn(table_name) {}

    function columnExists(table_name, field_name) {}

    function createTable(table_name, fields) {
      var table = ds.getTable(META_TABLE);
      if(tableExists(table_name))
        error("Table "+table_name+" already excists");
      table.insert({name:table_name});
    }

    function tableExists(table_name){
      var table = ds.getTable(META_TABLE);
      var result = table.query({name:table_name});
      if(result.length > 0)
        return true;
      return false;
    }

    function dropTable(table_name) {
      //to delete a Dropbox table all enties must be deleted
      var table = ds.getTable(table_name);
      var entries = table.query();
      for (key in entries){
        entires[key].deleteRecord();
      }
    }

    function truncate(table_name) {}

    function alterTable(table_name, new_fields, default_values){}

    function rowCount(table_name) {
      var table = ds.getTable(table_name);
      var items = table.query();
      return items.length;
    }

    function insert(table_name, data) {
      var table = ds.getTable(table_name);
      table.insert(data);
    }

    function select(table_name, ids, start, limit, sort) {}

    function sort_results(field, order) {}

    function queryByValues(table_name, data) {
      var table = ds.getTable(table_name);
      var items = table.query(data);
      var result = [];
      for(key in items){
        result.push(items[key].getFields());
      }
      return result;
    }

    function queryByFunction(table_name, query_function) {
      var table = ds.getTable(table_name);
      var items = table.query();
      var result = [];
      for(key in items){
        var item = items[key].getFields();
        if(query_function(clone(item))==true){
          result.push(item);
        }
      }
      return result;
    }

    function getIDs(table_name) {}

    function deleteRows(table_name, ids) {}

    function update(table_name, ids, update_function) {}

    function commit() {}

    function serialize() {}

    function clone(obj){
      var new_obj = {};
			for(var key in obj) {
				if( obj.hasOwnProperty(key) ) {
					new_obj[key] = obj[key];
				}
			}
			return new_obj;
    }

    function validateName(name) {}

    function validFields(table_name, data) {}

    function error(msg) {
      throw new Error(msg);
    }

    function limit(array, start, limit){
      if(typeof start == 'undefined' && typeof limit == 'undefined')
        return array;
      if(typeof start == 'undefined')
        return array.slice(0,limit);
      return array.slice(start,start+limit);
    }

    function validateData(table_name, data) {}

    return {
       createTable: function(table_name, fields){
         createTable(table_name, fields);
       },
       tableCount: function(){
         return tableCount();
       },
       dropTable: function(table_name){
         dropTable(table_name);
       },
       rowCount: function(table_name){
         return rowCount(table_name);
       },
       insert: function(table_name, data){
         insert(table_name,data);
       },
       query: function(table_name, query, limits, start, sort){
         if(!query){
           return limit(queryByValues(table_name),start,limits);
         }
         if(typeof query == 'function'){
           return limit(queryByFunction(table_name, query),start,limits);
         }
         if(typeof query == 'object')
         return limit(queryByFunction(table_name, query),start,limits);
       }

    }

  }
  // make amd compatible
	if(typeof define === 'function' && define.amd) {
		define(function() {
			return dropboxDB;
		});
	} else {
		_global['dropboxDB'] = dropboxDB;
	}
}(window));
