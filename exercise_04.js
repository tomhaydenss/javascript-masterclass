const DatabaseError = function (statement, message) {
  this.statement = statement;
  this.message = message;
};

let database = {
  tables: {},

  createTable(statement) {
    const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/;
    let result = regex.exec(statement);
    let tableName = result.groups.tableName;
    let columns = result.groups.columns
      .split(", ")
      .map(item => item.split(" "))
      .reduce((columns, [key, value]) => ({ ...columns, [key]: value }), {});

    this.tables = {
      ...this.tables,
      [tableName]: {
        columns,
        data: [],
      },
    };

    return this.tables;
  },

  execute(statement) {
    if (statement.startsWith("create table")) {
      return this.createTable(statement);
    }

    throw new DatabaseError(statement, `Syntax error: ${statement}`);
  },
};

try {
  database.execute(
    "create table author (id number, name string, age number, city string, state string, country string)"
  );
  database.execute("select id, name from author");
  console.log(JSON.stringify(database, undefined));
} catch (error) {
  console.error(error.message);
}
