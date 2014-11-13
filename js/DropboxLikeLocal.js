

!(function (_global, undefined){
  function switchManager(){
    function DropboxDB(app_key) {

      var ds = null

      client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
        if (error) {
          error('Cannot open  default datastore, got error: ' + error);
        } else {
          ds = datastore;
        }
      });
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
        // Tables are created on the fly
      }

      function dropTable(table_name) {
        //to delete a Dropbox table all enties must be deleted
        var entries = ds.query();
        for (key in item){
          item.deleteRecord();
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

      function queryByValues(table_name, data) {}

      function queryByFunction(table_name, query_function) {}

      function getIDs(table_name) {}

      function deleteRows(table_name, ids) {}

      function update(table_name, ids, update_function) {}

      function commit() {}

      function serialize() {}

      function validateName(name) {}

      function validFields(table_name, data) {}

      function error(msg) {
        throw new Error(msg);
      }

      function validateData(table_name, data) {}
      return {
         commit: function(){
           return commit();
         },
         isNew: function(){
           return db_new;
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
         }
      }

    }
  }
}(window));
