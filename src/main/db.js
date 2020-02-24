const nedb = require('nedb');

export default class WalletDb{
    constructor(dataSource){
        this.db = new nedb({
            filename: dataSource,
            autoload: true
          })
    }

    limit (offset, limit){
        this.offset = offset || 0;
        this.limit = limit || 15;
        return this;
    }
    
    sort(orderby) {
        this.orderby = orderby;
        return this;
    }
    
    find(query, select) {
        return new Promise((resolve, reject) => {
            let stmt = this.db.find(query || {});
            if (this.orderby !== undefined) {
                stmt.sort(this.orderby);
            }
            if (this.offset !== undefined) {
                stmt.skip(this.offset).limit(this.limit);
            }
            if (select != undefined) {
                stmt.projection(select || {});
            }
            stmt.exec((err, docs) => {
                if (err) {
                    return reject(err);
                }
                resolve(docs);
            })
        })
    };

   
    
    findOne(query, select) {
        return new Promise((resolve, reject) => {
            let stmt = this.db.findOne(query || {});
            if (this.sort !== undefined) {
                stmt.sort(this.sort);
            }
            if (select != undefined) {
                stmt.projection(select || {});
            }
            stmt.exec((err, doc) => {
                if (err) {
                    return reject(err);
                }
                resolve(doc);
            })
        })
    }

    
    insert(values) {
        return new Promise((resolve, reject) => {
            this.db.insert(values, (err, newDoc) => {
                if (err) {
                    console.err("dberror:",err)
                    return reject(err);
                }
                resolve(newDoc);
            })
        })
    }
    
    update(query, values, options) {
        return new Promise((resolve, reject) => {
            this.db.update(query || {}, values || {}, options || {}, (err, numAffected) => {
                if (err) {
                    console.err("dberror:",err)
                    return reject(err);
                }
                resolve(numAffected);
            })
        });
    }
    
    remove(query, multi) {
        return new Promise((resolve, reject) => {
            this.db.remove(query || {}, multi || {multi:false}, (err, numAffected) => {
                if (err) {
                    console.err("dberror:",err)
                    return reject(err);
                }
                resolve(numAffected);
            })
        });
    }
}

