const DatabaseError = function (statement, message) {
    this.statement = statement;
    this.message = message;
};

const Parser = function () {
    this.commands = {
        create: /create table (?<tableName>\w+) \((?<columns>.+)\)/,
        insert: /insert into (?<tableName>\w+) \((?<columns>.+)\) values \((?<values>.+)\)/,
        select: /select (?<columns>.+) from (?<tableName>\w+)(?: where (?<where>.+))?/,
        delete: /delete from (?<tableName>\w+) where (?<where>.+)/,
    };
    this.parse = (statement) => {
        const [command] = statement.split(" ");
        const regex = this.commands[command];
        const parsedStatement = regex.exec(statement);
        return { command, parsedStatement };
    };
};

let database = {
    parser: new Parser(),

    tables: {},

    create(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const columns = parsedStatement.groups.columns
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
    },

    insert(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const columns = parsedStatement.groups.columns.split(", ");
        const values = parsedStatement.groups.values.split(", ");
        const row = columns.reduce((row, column, index) => ({ ...row, [column]: values[index] }), {});

        this.tables[tableName].data.push(row);
    },

    select(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const columns = parsedStatement.groups.columns.split(", ");
        const where = parsedStatement.groups.where;
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

    delete(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const where = parsedStatement.groups.where;

        const [column, value] = where.split(" = ");
        const newData = this.tables[tableName].data.filter((row) => row[column] != value);

        this.tables[tableName].data = newData;
    },

    execute(statement) {
        const { command, parsedStatement } = this.parser.parse(statement);
        switch (command) {
            case "create":
                return this.create(parsedStatement);
            case "insert":
                return this.insert(parsedStatement);
            case "select":
                return this.select(parsedStatement);
            case "delete":
                return this.delete(parsedStatement);
            default:
                throw new DatabaseError(statement, `Syntax error: ${statement}`);
        }
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
