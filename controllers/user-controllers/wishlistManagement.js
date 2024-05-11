const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')
const ObjectId = require('mongoose')
// const Swal = require('sweetalert2')
const swal=require('sweetalert')

let userData







const showWishlistPage = async (req, res) => {
    userData = req.session.user
    try {
        let id = userData._id
        console.log(id, userData)

        // const WishListProd=await Wishlist.findOne({user:id}).lean()
      
        const wishlist = await Wishlist.findOne({ user: new mongoose.Types.ObjectId(id) });
        const wishlistCount = wishlist ? (wishlist.productId ? wishlist.productId.length : 0) : 0;

        const WishListProd = await Wishlist.aggregate([
            {
                $match: { user:new mongoose.Types.ObjectId(id) }
            }, 
            {
                $unwind:'$productId'
            }
            ,{
                $lookup:{
                    from:'products',
                    foreignField:'_id',
                    localField:'productId',
                    as:'product'
                }
            },
            {
                $project:{
                    _id: 1,
                    productId: 1,
                    productName:{$arrayElemAt:['$product.name',0]},
                    productImage:{$arrayElemAt:['$product.image',0]},
                    productPrice:{$arrayElemAt:['$product.price',0]},
                    productQuantity:{$arrayElemAt:['$product.stock',0]},
                }
            }
        ])
        console.log(WishListProd)
        res.render('user/wishlist', { userData, WishListProd ,wishCt:wishlistCount })

    } catch (error) {
        console.log(error)
    }
}

const addToWishList = async (req, res) => {
    try {
        let { id } = (req.body)
        // const Id = id.toString()
        const userId = req.session.user
        // console.log(Id)
        let productData = await Product.findById(id).lean()
        console.log(productData._id)
        const productId = new mongoose.Types.ObjectId(id);


        let wishlistData = await Wishlist.updateOne(
            {
                user: userId
            },
            {
                $addToSet: {
                    productId: productId,

                }

            },
            {
                upsert: true,
                new: true
            }
        )
        if (wishlistData.modifiedCount > 0) {
            res.json({ success: true });
          } else {
            res.json({ success: false });
          }


        console.log(wishlistData)
    } catch (error) {
        console.log(error)
    }

}
const removeFromWishList = async (req, res) => {
    try {
        let { id ,wishId} = req.body
        console.log(id,wishId)
     
      
       
        let productIdToRemove = new mongoose.Types.ObjectId(id);//// change the object to new object id before using in the DB query
        const wishListId = new mongoose.Types.ObjectId(wishId);
    
        // Update the Wishlist document to remove the specified productId
        let wishlistUpdateResult = await Wishlist.updateOne(
            { _id: wishListId },
            { $pull: { productId: productIdToRemove } }
        );
        if (wishlistUpdateResult.modifiedCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

        // const query = { _id: wishId };
        // // console.log(query)
        // const response = await Wishlist.findByIdAndUpdate(
        //     wishId,
        //   { $pull: { productId: new mongoose.Types.ObjectId(id) } },
        //   { new: true }
        // );
    
    } catch (error) {
        console.log(error) 
    } 

}

module.exports = {
    showWishlistPage,
    addToWishList,
    removeFromWishList
}