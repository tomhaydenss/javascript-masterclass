const DatabaseError = function (statement, message) {
    this.statement = statement;
    this.message = message;
};

let database = {
    tables: {},

    createTable(statement) {
        const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/;
        const result = regex.exec(statement);
        const tableName = result.groups.tableName;
        const columns = result.groups.columns
            .split(", ")
            .map((item) => item.split(" "))
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

    insert(statement) {
        const regex = /insert into (?<tableName>\w+) \((?<columns>.+)\) values \((?<values>.+)\)/;
        const result = regex.exec(statement);
        const tableName = result.groups.tableName;
        const columns = result.groups.columns.split(", ");
        const values = result.groups.values.split(", ");
        const row = columns.reduce((row, column, index) => ({ ...row, [column]: values[index] }), {});

        this.tables[tableName].data.push(row);
        return this.tables;
    },

    execute(statement) {
        if (statement.startsWith("create table")) {
            return this.createTable(statement);
        }
        if (statement.startsWith("insert into")) {
            return this.insert(statement);
        }

        throw new DatabaseError(statement, `Syntax error: ${statement}`);
    },
};

try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    console.log(JSON.stringify(database, undefined, 2));
} catch (error) {
    console.error(error.message);
}
