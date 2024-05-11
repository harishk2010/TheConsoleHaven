const Cart = require('../../models/cart')
const Wishlist = require('../../models/wishlist')
const { Product } = require('../../models/productsSchema')
const mongoose = require('mongoose')

const loadCartPage = async (req, res) => {
    try {
        let userData = req.session.user
        const ID = new mongoose.Types.ObjectId(userData._id)
        //    let cartProd=await Cart.find({userId:userData._id},{product_Id:1,_id:0}).lean()
        let cartProd = await Cart.aggregate([
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
        console.log(subTotal, "SUBTOTAL")
        
        console.log(cartProd)
        if(cartProd.length>0){
            res.render('user/cart', { userData, cartProd ,subTotal:subTotal[0].total })


        }else
        {
            res.render('user/emptyCart', { userData })
        }


    } catch (error) {
        console.log(error)
    }
}
const addToCart = async (req, res) => {
    try {
        let userData = req.session.user;
        console.log(userData._id);
        const data = req.body;
        console.log(data);

        const ProductExist = await Cart.find({
            userId: userData._id,
            product_Id: data.prodId
        }).lean()//this is wrong
        const sampProd = await Product.findOne({

            _id: data.prodId
        }).lean()
        console.log(ProductExist.length)
        console.log(sampProd)
        if (ProductExist.length > 0) {
            return res.json({
                success: false,
                message: 'Product already exist in cart'
            })
        }

        // Ensure quantity is not empty
        if (data.quantity <= 0) {
            res.json({
                success: false,
                message: 'Quantity cannot be Zero or Negative!!!'
            });
        } else {

            // Update the cart item or create a new one if not found
            const cartData = await Cart.findOneAndUpdate(
                {
                    userId: userData._id,
                    product_Id: data.prodId
                },
                {
                    quantity: data.quantity,
                    price: sampProd.price

                },
                { new: true, upsert: true } // Create new if not found
            );

            console.log(cartData);
            if (cartData) {
                res.json({
                    success: true,
                    message: "Product added to cart",
                    cartItem: cartData
                });
            } else {

            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const removeFromCart = async (req, res) => {
    try {
        const userData = req.session.user;
        const { id } = req.body
        const removeCartItem = await Cart.findByIdAndDelete({ _id: id })
        if (removeCartItem) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error)
    }
}

const updateCart = async (req, res) => {
    try {
        const userData = req.session.user;
        const ID = new mongoose.Types.ObjectId(userData._id)
        const { cartIdForUpdate } = req.body
        const oldCart = await Cart.findOne({ _id: req.body.cartIdForUpdate });
        console.log(cartIdForUpdate, oldCart)


        const price = oldCart.price;

        const newValue = req.body.newValue * price;
        console.log(cartIdForUpdate, newValue)

        


        const updatedcartvalue = await Cart.updateOne(
            { _id: req.body.cartIdForUpdate },
            { $set: { quantity: req.body.newValue, value: newValue } }
        );
        console.log(updatedcartvalue)
        const updatedCart = await Cart.find({ _id: req.body.cartIdForUpdate }).lean();
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
        console.log(subTotal, "SUBTOTAL")

        const newData = [];





        updatedCart.forEach(data => {

            const newDataItem = { ...data }; // Create a copy of the original object

            if (data.totalAmount) {
                newDataItem.totalAmount = newValue;
            } else {
                newDataItem.totalAmount = newValue;
            }

            newData.push(newDataItem);
        });
        console.log(newData, "itemsitemssss")
        const cartValue = newData.reduce((acc, item) => acc + item.totalAmount, 0)
        console.log(cartValue)
        res.json({
            message: "updated",
            cartProd: newData,
            items: newData,
            cartValue: subTotal,
            
            

        }
        )


        console.log(newData[0].totalAmount)

        // const totalCartValue = await Cart.aggregate([
        //   { $match: { userId: req.session.user_id } },
        //   { $group: { _id: "", totalValue: { $sum: "$value" } } },
        //   { $project: { _id: 0, totalValue: 1 } }
        // ]);

    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadCartPage,
    addToCart,
    removeFromCart,
    updateCart
}