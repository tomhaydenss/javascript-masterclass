const sql = "create table author (id number, name string, age number, city string, state string, country string)";
const regex = /create table (?<tableName>\w+) \((?<columns>.+)\)/

let result = regex.exec(sql);
let tableName = result.groups.tableName;
let columns = result.groups.columns.split(", ");

console.log("tableName", tableName);
console.log("columns", columns);
