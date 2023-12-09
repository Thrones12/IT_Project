const MySqli = require('mysqli');

let conn = new MySqli({
    host: 'localhost',
    post: 3306,
    user: 'root',
    passwd: '123456',
    db: 'itproject_ecommerce'
})

let db = conn.emit(false,'');

module.exports = {
    database: db
};
