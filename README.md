# mIDB
IindexedDB wrapper

# Usage

```
// open database
db = mIDB(dbName)

// open store / table
//table = db(tableName, tableOpts = {}, indexes = []
table = db(
    "table1", 
    { keyPath: 'id', autoIncrement: true }, 
    [
        // indexName, indexPath, indexOpts = {}
        'path', 'path', {},
        'path+time', ['path', 'time'], {}
    ]
)

// add entries
table.set({ path: "path" })
table.set[{path: "path1"}, {path: "path2"}]

// get entries
table.get()  // all...
table.get(1) // keyPath "id"
table.get("path1", "path")  // by index path
table.get(IDBKeyRange.bound('path', 'path\uffff')) // "path*"

// count entries
table.count()

// delete....
table.delete(...)

// flush table
table.flush()
```
