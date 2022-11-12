import { DatabaseError } from "./database-error.mjs";
import { Parser } from "./parser.mjs";

export class Database {
    constructor() {
        this.parser = new Parser();
        this.tables = {};
    }

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
    }

    insert(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const columns = parsedStatement.groups.columns.split(", ");
        const values = parsedStatement.groups.values.split(", ");
        const row = columns.reduce((row, column, index) => ({ ...row, [column]: values[index] }), {});

        this.tables[tableName].data.push(row);
    }

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
        return result;
    }

    delete(parsedStatement) {
        const tableName = parsedStatement.groups.tableName;
        const where = parsedStatement.groups.where;

        const [column, value] = where.split(" = ");
        const newData = this.tables[tableName].data.filter((row) => row[column] != value);

        this.tables[tableName].data = newData;
    }

    execute(statement) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = this.parser.parse(statement);
                if (result) {
                    resolve(this[result.command](result.parsedStatement));
                }
                reject(new DatabaseError(statement, `Syntax error: ${statement}`));
            }, 1000);
        });
    }
}
