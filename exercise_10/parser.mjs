export class Parser {
    constructor() {
        this.commands = {
            create: /create table (?<tableName>\w+) \((?<columns>.+)\)/,
            insert: /insert into (?<tableName>\w+) \((?<columns>.+)\) values \((?<values>.+)\)/,
            select: /select (?<columns>.+) from (?<tableName>\w+)(?: where (?<where>.+))?/,
            delete: /delete from (?<tableName>\w+) where (?<where>.+)/,
        };
    }

    parse(statement) {
        const [command] = statement.split(" ");
        const regex = this.commands[command];
        if (regex) {
            const parsedStatement = regex.exec(statement);
            return { command, parsedStatement };
        }
    }
}