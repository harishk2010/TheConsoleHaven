const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const { Address } = require('../../models/addressSchema')
const Cart = require('../../models/cart')
const Order = require('../../models/order')

const mongoose = require('mongoose')
const ObjectId = require('mongoose')


const viewUserProfile = async (req, res) => {
    try {

        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id);
        const userDataObject = userData.toObject();
        res.render('user/profile', { userData: userDataObject });
        console.log(userData)
        // res.render('user/profile',{userData})
    } catch (error) {
        console.log(error)
    }
}

const EditUserProfile = async (req, res) => {
    try {

        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id);
        const userDataObject = userData.toObject();
        console.log(userData)
        res.render('user/editProfile', { userData: userDataObject })
    } catch (error) {
        console.log(error)
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const image = req.file
        let imageFileName;
        if (req.file) {
            imageFileName = req.file.filename;
        } else {
            imageFileName = req.session.user.image;
        }


        const id = req.params.id

        await User.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                image: imageFileName
            }
        }, { new: true })

        res.redirect('/profile')

    } catch (error) {
        console.log(error);
    }
}


/// To get manage address page ///


// const  manageAddress = async(req, res) => {
//     try {
//         // const userData = req.session.user
//         // const id       = userData._id
//         // const userAddress = await Address.find({userId : id})


//         const user=req.session.user
//         const id = user._id
//         const userAddress = await Address.find({userId : id})
//         const userAddressObject = userAddress.toObject();
//         const userData = await User.findById(id);
//         const userDataObject = userData.toObject();


//         res.render('user/address', {userAddress:userAddressObject, userData:userDataObject})
//     } catch (error) {
//         console.log(error);
//     }
// }

const manageAddress = async (req, res) => {
    try {
        const user = req.session.user;
        const id = user._id;

        // Find user addresses
        const userAddresses = await Address.find({ userId: id }).lean();
        // console.log(userAddresses)

        // Fetch user data
        const userData = await User.findById(id);
        // console.log(userData)

        // Render the 'address' template with user addresses and data
        res.render('user/address', { userAddress: userAddresses, userData: userData });
    } catch (error) {
        console.log(error);
    }
}




const addAddress = async (req, res) => {
    try {
        res.render('user/addAddress')
    } catch (error) {
        console.log(error);
    }
}

const addAddressPost = async (req, res) => {
    try {
        const userData = req.session.user
        const id = userData._id

        const adress = new Address({
            userId: id,
            name: req.body.name,
            mobile: req.body.mobile,
            addressLine1: req.body.address1,
            addressLine2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            is_default: false,
        })

        const adressData = await adress.save()
        res.redirect('/addresses')
    } catch (error) {
        console.log(error);
    }
}

const editAddressPost = async (req, res) => {
    try {

        const id = req.params.id

        await Address.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile,
                addressLine1: req.body.address1,
                addressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
            }
        }, { new: true })

        res.redirect('/addresses')

        // Find user addresses
        // const userAddresses = await Address.find({ userId: id }).lean();
        // res.render('user/editAddress')
    } catch (error) {
        console.log(error);
    }
}

const editAddress = async (req, res) => {
    try {

        const id = req.params.id

        const address = await Address.findById(id);
        const addressObject = address.toObject();
        console.log(address)

        res.render('user/editAddress', { address: addressObject })
    } catch (error) {
        console.log(error);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id
        const ID = new mongoose.Types.ObjectId(id)
        console.log(ID)
        await Address.findByIdAndDelete(id)
        console.log(id)
        res.redirect('/addresses')

    } catch (error) {
        console.log(error)
    }
}

const myorders = async (req, res) => {
    try {
        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id).lean();
        // const userDataObject = userData.toObject();

        console.log(userData, "userdata")
        // const Id
        const myOrders = await Order.find({ userId: id }).lean()
        console.log(myOrders, "myOrders")
        res.render('user/myOrders', { userData: userData, myOrders })

    } catch (error) {
        console.log(error)
    }
}
const orderDetails = async (req, res) => {
    try {
        const orderId = req.params.id
        const IDORDER = new mongoose.Types.ObjectId(orderId)
        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id).lean();
        // const userDataObject = userData.toObject();

        // console.log(userData,"userdata")
        // const Id
        const myOrderDetails = await Order.findOne({ _id: orderId }).lean()
        const address = await Address.findOne({ _id: myOrderDetails.address }).lean()
        console.log(address, "myOrderDetails")
        const orderedProDet = await Order.aggregate([
            {
                $match: { _id: IDORDER }
            },
            {
                $unwind: "$product"
            },
            {
                $unwind: "$product" // Unwind the nested array
            },
            {
                $project: {
                    _id: 0,
                    product: 1,

                }
            }



        ])
        console.log(orderedProDet)
        res.render('user/orderDetails', { orderedProDet, myOrderDetails, userData, address })

    } catch (error) {

    }
}

// const EditUserProfile= async(req,res)=>{
//     try {

//         const user=req.session.user
//         const id = user._id
//         const userData = await User.findById(id);
//         const userDataObject = userData.toObject();
//         console.log(userData)
//         res.render('user/editProfile', { userData: userDataObject })
//     } catch (error) {
//         console.log(error)
//     }
// }






module.exports = {
    viewUserProfile,
    EditUserProfile,
    updateUserProfile,
    manageAddress,
    addAddress,
    addAddressPost,
    editAddress,
    editAddressPost,
    deleteAddress,


    //////orders
    myorders,
    orderDetails
}