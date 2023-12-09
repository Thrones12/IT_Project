const express = require('express');
const router = express.Router();
const{database} = require('../config/helpers');





/* Lấy toàn bộ sản phẩm */
router.get('/', function(req, res, next) {
  let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page :  1; //set số của trang mặc định
  const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; //set số item hiển thị

  let startValue;
  let endValue;

  if(page > 0){
    startValue = (page * limit) - limit; //trang 0, 10 ,20 ,30
    endValue = page * limit;
  }else{
    startValue = 0;
    endValue = 10;
  }

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: 'c.id = p.cat_id'
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: 'Không có sản phầm nào được tìm thấy'});
            }
        }).catch(err => console.log(err))
});

// Lấy chi tiết 1 sản phẩm
router.get('/:prodId',(req,res) =>{
    // Nhận biến nạp vào
    let productId = req.params.prodId;
    console.log(productId);



    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: 'c.id = p.cat_id'
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.image',
            'p.images',
            'p.id'
        ])
        .filter({'p.id' : productId})
        .get() //vì 1 sản phaarm nên thay vì getAll sẽ get
        .then(prod => {
            if (prod) {
                res.status(200).json(prod);
            } else {
                res.json({message: `Không tồn tại sản phẩm này với mẫ ${productId}`});
            }
        }).catch(err => console.log(err))
});


// Lấy sản phẩm theo danh mục sản phẩm
router.get('/category/:catName',(req,res) =>{
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page :  1; //set số của trang mặc định
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10; //set số item hiển thị

    let startValue;
    let endValue;

    if(page > 0){
        startValue = (page * limit) - limit; //trang 0, 10 ,20 ,30
        endValue = page * limit;
    }else{
        startValue = 0;
        endValue = 10;
    }

    const cat_title = req.params.catName; //biến lấy cat name từ url (phương thức get)

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}'` //Code không khác gì lấy toàn bộ sản phẩm nhưng thêm điều kiện lấy cat ở đây
        }])
        .withFields(['c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                res.status(200).json({
                    count: prods.length,
                    products: prods
                });
            } else {
                res.json({message: `Không sản phầm nào được tìm thấy từ category ${cat_title}`});
            }
        }).catch(err => console.log(err))
})

module.exports = router;