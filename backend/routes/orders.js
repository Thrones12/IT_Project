const express = require('express');
const router = express.Router();
const{database} = require('../config/helpers');

/* Lấy toàn bộ orders */
router.get('/', (req, res) =>{
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id','p.title', 'p.description','p.price','u.username'])
        .sort({id: 1})
        .getAll()
        .then(orders => {
            if(orders.length > 0) {
                res.status(200).json(orders);
            }else{
                res.json({message: 'Không có đơn hàng nào được tìm thấy'});
            }

        }).catch(err => console.log(err));
});
// Xem chi tiết 1 hoá đơn
router.get('/:id',(req, res)=>{
    const orderId = req.params.id;

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id','p.title', 'p.description','p.price','u.username'])
        .filter({'o.id': orderId}) //thêm id vào filtler để lấy đơn hàng
        .getAll()
        .then(orders => {
            if(orders.length > 0) {
                res.status(200).json(orders);
            }else{
                res.json({message: `Không có đơn hàng nào được tìm thấy với mã đơn hàng ${orderId}`});
            }

        }).catch(err => console.log(err));
});
// thêm đơn hàng
router.post('/new', (req, res) => {
    // let userId = req.body.userId;
    // let products = req.body.products;
    let{userId,products} = req.body;
    console.log(userId);
    console.log(products);

    if(userId !== null && userId > 0){
        database.table('orders')
            .insert({
                user_id: userId
            }).then((result) => {
            const newOrderId = result.insertId; //result sẽ trả về 1 object gồm 1 tổ hợp in4 nên phải gán như vậy để lấy riêng mã sản phẩm
            console.log(newOrderId);
            if(newOrderId>0){
                products.forEach(async (p)=>{

                        let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();

                    let inCart = parseInt(p.incart);

                    //Trừ đi số lượng của món hàng trong kho sau khi đặt mua
                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }
                    //     Thêm order details dựa treen ID
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(successNum => {
                        }).catch(err => console.log(err));

                    }).catch(err => console.log(err));
                });
            }
             else {
                  res.json({message: 'Có lỗi xảy ra trong quá trình thêm order', success :false});
            }
            res.json({
                message: `Thêm đơn hàng thành công với mã đơn hàng ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => console.log(err))
    }
    else{
        res.json({message: 'Có lỗi xảy ra trong quá trình thêm order', success :false});
    }
});

// PAYMENT GATEWAY
router.post('/payment',(req, res)=>{
    setTimeout(()=>{
        res.status(200).json({success: true});
    }, 3000)
});

module.exports = router;

