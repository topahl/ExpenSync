
!(function (_global, undefined){
  function dropboxDB(app_key) {

    var META_TABLE = '_dbtables';

    var ds = null;
    var client = null;
    var callback = [];
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
          ds.recordsChanged.addListener(recordsChanged);
        }
      });
    }

    function recordsChanged(obj){
      if(!obj.isLocal())
        console.log("External Change detected");
      for(key in callback){
        if(typeof callback[key] != 'undefined')
          callback[key](obj);
      }
    }

    function drop() {}

    function tableCount() {
      var list = ds.listTableIds()
      return list.length;
    };

    function tableFields(table_name) {}

    /**
     * Checks whether a table exists and throws an error if not
     *
     * @param {string} table name The name of the table to be checked
     */
    function tableExistsWarn(table_name) {
      if(!tableExists(table_name)){
        error("The table: '"+table_name+"' does not exist");
      }
    }

    function columnExists(table_name, field_name) {}

    /**
     * Adds a change Listener to the list of called methods. These methods will
     * be called if a remote change in the dropbox datastores was detected.
     * There is no guarantee on a call sequence of these methods.
     *
     * @param {function} listener The function that should be called if a change was detected
     * @author topahl
     */
    function addListener(listener){
      if(typeof listener != 'function')
        error("Listener has to be a function");
      callback.push(listener);
    }

    /**
     * Removes a change listener from the list of called methods if a remote
     * change was detected
     *
     * @param {function} listener The specific listener that should be removed
     * @author topahl
     */
    function removeListener(listener){
      var i = callback.indexOf(listener);
      if(i == -1)
        error("Listener is not registered");
      delete callback[i];
    }

     /**
     * Creates a logical table on the dropbox datastores
     * Defines fiels and table name for the new table
     *
     * @param {string} table_name The name of the table that should be created
     * @param {object} fields A string array that defines all field names for the new table
     * @author topahl
     */
    function createTable(table_name, fields) {
      validateName(table_name);
      var table = ds.getTable(META_TABLE);
      if(tableExists(table_name))
        error("Table "+table_name+" already excists");
      var record = table.insert({name:table_name,auto_increment:0});
      var list = record.getOrCreateList("fields");
      for(key in fields){
        list.push(fields[key]);
      }
    }

    /**
     * Checks whether a table exists
     *
     * @param {string} table_name The table to check
     * @return {boolean} true = table exists, false = table does not exist
     * @author topahl
     */
    function tableExists(table_name){
      var table = ds.getTable(META_TABLE);
      var result = table.query({name:table_name});
      if(result.length > 0)
        return true;
      return false;
    }

    /**
     * Deletes a Table and its content
     *
     * @param {string} table_name The name of the table that shouöd be deleted
     * @author topahl
     */
    function dropTable(table_name) {
      //to delete a Dropbox table all enties must be deleted
      truncate(table_name);
      deleteRows(META_TABLE,{name:table_name});
    }

    /**
     * Deletes all entries from a given table and resets its auto increment value
     *
     * @param {string} table_name The name of the table that should be reseted
     * @author topahl
     */
    function truncate(table_name) {
      var table = ds.getTable(table_name);
      var entries = table.query();
      for (key in entries){
        entries[key].deleteRecord();
      }
      ds.getTable(META_TABLE).query({name:table_name})[0].set("auto_increment",0);

    }

    function alterTable(table_name, new_fields, default_values){}

    /**
     * Counts the rows of a given table
     *
     * @param {string} table_name The name of the table which is counted
     * @return {number} number of rown in the sekected table
     * @author topahl
     */
    function rowCount(table_name) {
      var table = ds.getTable(table_name);
      var items = table.query();
      return items.length;
    }

    /**
    * Inserts a record into the given table of the dropbox datastore
    *
    * @param {string} table_name The name of the table to insert into
    * @param {object} data The one dimensional object to add into the datastore
    * @author topahl
    */
    function insert(table_name, data) {
      validateFields(table_name,data);
      var table = ds.getTable(table_name);
      var ai = getNextAutoIncrement(table_name);
      data.ID = ai;
      table.insert(data);
    }



    /**
    * Creates a compareTo function that compares a spezified fields from two
    * objects in descending or ascending order
    *
    * @param {string} field The field the sort should apply to
    * @param {string} Either 'DESC' for an descending order or 'ASC' for acending. Anything else is interpredted like 'ASC'
    * @return {function} compare to function that can be uses to sort an array
    * @author topahl
    */
    function sort_results(field, order) {
      if(order === "DESC"){
        return function(a,b){
          var v1 = typeof (a[field]) === "string" ? a[field].toLowerCase() : a[field];
          var v2 = typeof (b[field]) === "string" ? b[field].toLowerCase() : b[field];
          return v1 == v2 ? 0 : (v1 < v2 ? 1 : -1);
        }
      }
      else{
        return function(a,b){
          var v1 = typeof (a[field]) === "string" ? a[field].toLowerCase() : a[field];
          var v2 = typeof (b[field]) === "string" ? b[field].toLowerCase() : b[field];
          return v1 == v2 ? 0 : (v1 > v2 ? 1 : -1);
        }
      }
    }

    function getNextAutoIncrement(table_name){
      var table = ds.getTable(META_TABLE);
      var record = table.query({name:table_name})[0];
      var ai = record.get("auto_increment");
      record.set("auto_increment",ai+1);
      return ai;
    }

    function queryByValues(table_name, data) {
      var table = ds.getTable(table_name);
      var items = table.query(data);
      return getObjects(items);
    }

    function queryByFunction(table_name, query_function) {
      var table =  ds.getTable(table_name);
      var items = getObjects(table.query());
      var result = [];
      for(key in items){
        var item = items[key];
        if(query_function(clone(item))==true){
          result.push(item);
        }
      }
      return result;
    }

    function getIDs(table_name) {}

    function deleteRows(table_name, query) {
      var result = select(table_name,query);
      var table = ds.getTable(table_name);
      var number = result.length;
      for(key in result){
        table.get(result[key]._uuid).deleteRecord();
      }
      return number;
    }

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

    function validateName(name) {
      if(name.indexOf("_") == 0)
        error("Names with starting '_' are reserved");
    }

    function validateFields(table_name, data) {
      var table = ds.getTable(META_TABLE);
      var result = {};
      var record = table.query({name:table_name})[0];
      var fields = record.get("fields").toArray();
      for(key in data){
        console.log(key);
        if(fields.indexOf(key) == -1){
          error("The field: '"+key+"' is not defined");
        }
      }
    }

    function select(table_name, query, start, limit, sort) {
      var result;
      if(typeof query === 'undefined' || query === null){
        result = queryByValues(table_name);
      }
      if(typeof query === 'function'){
        result = queryByFunction(table_name, query);
      }
      if(typeof query === 'object'){
        result = queryByValues(table_name, query);
      }
      result = limit_result(result,start,limit);
      for(key in sort){
        var comp = sort_results(sort[key][0],sort[key][1]);
        console.log(comp("tobias","nico"));
        console.log(comp("nico","nico"));
        console.log(comp("nico","tobias"));
        result.sort(comp);
      }
      return result;

    }

    function error(msg) {
      throw new Error(msg);
    }

    function limit_result(array, start, limit){
      start = (typeof start === 'undefined') ? 0 : start;
      limit = (typeof limit === 'undefined') ? null : limit;
      if(typeof array === 'undefined'){
        return array;
      }
      if(limit === null)
        return array.slice(start);
      return array.slice(start,start+limit);
    }

    function getObjects(array){
      var result = [];
      for(key in array){
        var item = array[key].getFields();
        item._uuid = array[key].getId();
        result.push(item);
      }
      return result;
    }

    return {
       commit: function(){

       },
       createTable: function(table_name, fields){
         createTable(table_name, fields);
       },
       tableCount: function(){
         return tableCount();
       },
       dropTable: function(table_name){
         tableExistsWarn(table_name);
         dropTable(table_name);
       },
       rowCount: function(table_name){
         tableExistsWarn(table_name);
         return rowCount(table_name);
       },
       insert: function(table_name, data){
         tableExistsWarn(table_name);
         insert(table_name,data);
       },
       query: function(table_name, query, limits, start, sort){
         tableExistsWarn(table_name);
         return select(table_name, query, limits, start, sort);
       },
       queryAll: function(table_name, params){
         return this.query(table_name,
           params.hasOwnProperty('query') ? params.query : null,
					 params.hasOwnProperty('limit') ? params.limit : null,
					 params.hasOwnProperty('start') ? params.start : null,
				 	 params.hasOwnProperty('sort') ? params.sort : null
				 );
       },
       deleteRows: function(table_name, query){
         tableExistsWarn(table_name);
         return deleteRows(table_name, query)
       },
       addListener: function(listener){
         addListener(listener);
       },
       removeListener: function(listener){
         removeListener(listener);
       },
       truncate: function(table_name){
         truncate(table_name);
       },
       tableExists: function(table_name){
         return b(table_name);
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
