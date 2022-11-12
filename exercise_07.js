const DatabaseError = function (statement, message) {
    this.statement = statement;
    this.message = message;
};

let database = {
    tables: {},

    createTable(statement) {
        const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/;
        const parsed = regex.exec(statement);
        const tableName = parsed.groups.tableName;
        const columns = parsed.groups.columns
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
        const parsed = regex.exec(statement);
        const tableName = parsed.groups.tableName;
        const columns = parsed.groups.columns.split(", ");
        const values = parsed.groups.values.split(", ");
        const row = columns.reduce((row, column, index) => ({ ...row, [column]: values[index] }), {});

        this.tables[tableName].data.push(row);
        return this.tables;
    },

    select(statement) {
        const regex = /select (?<columns>.+) from (?<tableName>\w+)(?: where (?<where>.+))?/;
        const parsed = regex.exec(statement);
        const tableName = parsed.groups.tableName;
        const columns = parsed.groups.columns.split(", ");
        const where = parsed.groups.where;
        let rows = this.tables[tableName].data;
        if (where != null) {
            const [column, value] = where.split(" = ");
            rows = rows.filter((row) => row[column] == value);
        }
        const result = rows.map((row) =>
            Object.entries(row).reduce((obj, [key, value]) => {
                if (columns.includes(key)) {
                    return { ...obj, [key]: value };
                }
                return obj;
            }, {})
        );
        console.log(result);
    },

    delete(statement) {
        const regex = /delete from (?<tableName>\w+) where (?<where>.+)/;
        const parsed = regex.exec(statement);
        const tableName = parsed.groups.tableName;
        const where = parsed.groups.where;

        const [column, value] = where.split(" = ");
        const newData = this.tables[tableName].data.filter((row) => row[column] != value);
        this.tables[tableName].data = newData;
    },

    execute(statement) {
        if (statement.startsWith("create table")) {
            return this.createTable(statement);
        }
        if (statement.startsWith("insert into")) {
            return this.insert(statement);
        }
        if (statement.startsWith("select")) {
            return this.select(statement);
        }
        if (statement.startsWith("delete")) {
            return this.delete(statement);
        }

        throw new DatabaseError(statement, `Syntax error: ${statement}`);
    },
};

try {
    database.execute("create table author (id number, name string, age number, city string, state string, country string)");
    database.execute("insert into author (id, name, age) values (1, Douglas Crockford, 62)");
    database.execute("insert into author (id, name, age) values (2, Linus Torvalds, 47)");
    database.execute("insert into author (id, name, age) values (3, Martin Fowler, 54)");
    database.execute("delete from author where id = 2");
    database.execute("select name, age from author");
} catch (error) {
    console.error(error.message);
}
