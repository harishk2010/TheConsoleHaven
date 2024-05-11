const adminDashboard= async (req,res)=>{
    try {
        res.render('admin/dashBoard',{title:"Admin",layout:'adminlayout'})
    } catch (error) {
        
    }
}

module.exports={
    adminDashboard
}