const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const { Address } = require('../../models/addressSchema')
const Cart = require('../../models/cart')
const Order=require('../../models/order')

const mongoose = require('mongoose')
const ObjectId = require('mongoose')




const loadCheckoutPage = async (req, res) => {
    try {
        userData = req.session.user
        const ID = new mongoose.Types.ObjectId(userData._id)

        console.log(userData._id)
        const addressData = await Address.find({ userId: userData._id }).lean()
        console.log(addressData)

        ///subtotal
        const subTotal = await Cart.aggregate([
            {
                $match: {
                    userId: ID
                },

            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$value" }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1
                }
            }

        ])
        let cart = await Cart.aggregate([
            {
                $match: {
                    userId: ID
                }
            },
            {
                $lookup: {
                    from: 'products',
                    foreignField: '_id',
                    localField: 'product_Id',
                    as: 'productData'
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    quantity: 1,
                    value: 1,
                    productName: { $arrayElemAt: ["$productData.name", 0] },
                    productPrice: { $arrayElemAt: ["$productData.price", 0] },
                    productDescription: { $arrayElemAt: ["$productData.description", 0] },
                    productImage: { $arrayElemAt: ["$productData.image", 0] }

                }
            }

        ])
        console.log(cart)
        console.log(subTotal, "SUBTOTAL")

        res.render('user/checkout', {
            userData,
            addressData,
            subTotal: subTotal[0].total,
            cart
        })

    } catch (error) {
        console.log(error)
    }
}

const placeorder = async (req, res) => {
    try {
        userData = req.session.user
        const ID = new mongoose.Types.ObjectId(userData._id)
        const addressId = req.body.selectedAddress
        const payMethod = req.body.selectedPayment
        const totalamount =req.body.amount
        console.log(addressId, payMethod ,totalamount)

        const result  = Math.random().toString(36).substring(2, 7);
       const id      = Math.floor(100000 + Math.random() * 900000);
       const ordeId = result + id;

       const productInCart= await Cart.aggregate([
        {
            $match: {
                userId: ID
            }
        },
      
        {
            $lookup: {
                from: 'products',
                foreignField: '_id',
                localField: 'product_Id',
                as: 'productData'
            }
        },
        {
            $project: {
                product_Id: 1,
                userId: 1,
                quantity: 1,
                value: 1,
                name: { $arrayElemAt: ["$productData.name", 0] },
                price: { $arrayElemAt: ["$productData.price", 0] },
                productDescription: { $arrayElemAt: ["$productData.description", 0] },
                image: { $arrayElemAt: ["$productData.image", 0] }

            }
        }
        
    ])

       const SampproductInCart=await Cart.aggregate([
        {
            $match: {
                userId: ID
            }
        },
        {
            $lookup: {
                from: 'products',
                foreignField: '_id',
                localField: 'product_Id',
                as: 'productData'
            }
        },
        {
            $project: {
                product_Id: 1,
                userId: 1,
                quantity: 1,
                value: 1,
                productName: { $arrayElemAt: ["$productData.name", 0] },
                productPrice: { $arrayElemAt: ["$productData.price", 0] },
                productDescription: { $arrayElemAt: ["$productData.description", 0] },
                productImage: { $arrayElemAt: ["$productData.image", 0] }

            }
        }
        ])
        let productDet = SampproductInCart.map(item => {
            return {
               _id      : item.product_Id,
                name     : item.productName,
                price    : item.productPrice,
                quantity : item.quantity,
                image    : item.productImage[0],
            }
           })
           console.log(productInCart,"aggregated cart prods")
           console.log(productDet,"aggregated cart prods")
    //  productDet = SampproductInCart.map(item => {
    //     return {
    //        _id:item.product_Id
         
    //     }
    //    })
       console.log(SampproductInCart,"aggregated cart prods")
       console.log(productDet," 11111111111 aggregated cart prods")


        const order = new Order({
            userId  : ID,
            product : productDet,
            address : addressId,
            orderId : ordeId,
            total   : totalamount,
            paymentMethod    : payMethod,     
        })

        const ordered = await order.save()
        // productDet.forEach(async(product)=>{
        //     await Product.updateMany({_id:product._id},{$inc:{stock:-produc.quantity}});

        // })
        console.log(ordered,"ordersaved DATAAAA")
        const deletedCart=await Cart.deleteMany({
            userId: ID
        }).lean()
        console.log(deletedCart,"deletedCart")
        // res.redirect('/orderPlaced')
        res.json({
            COD:true,
        })

    } catch (error) {
        console.log(error)
    }
}
const orderSuccess = async (req, res) => {
    try {
      
  
      res.render("user/orderPlaced", {
      
        title: "Order Placed",
  
      } );
  
  
    } catch (error) {
      console.log(error);
    }
  };
module.exports = {
    loadCheckoutPage,
    placeorder,
    orderSuccess
}