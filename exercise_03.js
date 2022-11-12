let database = {
  tables: {},

  createTable(statement) {
    const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/
    let result = regex.exec(statement);
    let tableName = result.groups.tableName;
    let columns = result.groups.columns
		    .split(", ")
		    .map(item => item.split(" "))
		    .reduce((columns, [key, value]) => ({ ...columns, [key]: value}), {});

    this.tables = {
      ...this.tables,
      [tableName]: { 
        columns,
	data: []
      }
    }

    return JSON.stringify(this.tables, undefined, " ");
  },

  execute(statement) {
    if (statement.startsWith("create table")) {
      return this.createTable(statement);
    } else {
      return "invalid sql statement";
    }
  }
}

let result = database.execute("create table author (id number, name string, age number, city string, state string, country string)");
console.log(result);
