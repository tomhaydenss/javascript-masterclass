const sql = "create table author (id number, name string, age number, city string, state string, country string)";
const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/

let result = regex.exec(sql);
let tableName = result.groups.tableName;
let columns = result.groups.columns.split(", ");

let columnsObj = columns.map(item => item.split(" ")).reduce((columns, [key, value]) => { columns[key] = value; return columns}, {})
let database = { tables: {} }
database.tables[tableName] = {columns: columnsObj, data: []}

console.log(JSON.stringify(database, undefined, " "))
