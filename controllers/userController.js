const userService = require('../services/userService');

exports.list = async (req,res)=>{

    const users = await userService.getAll();

    res.render('users/list',{

        user:req.session.user,

        users

    });

};

exports.createPage=(req,res)=>{

    res.render('users/create',{

        user:req.session.user

    });

};

exports.create=async(req,res)=>{
    try {

    await userService.create(req.body);

    res.redirect('/users');
} catch (err) {
    

    res.render('users/create', {
        user:req.session.user,
        error: err.message
    });

}

};

exports.editPage=async(req,res)=>{

    const cashier = await userService.getById(req.params.id);

    res.render('users/edit',{

        user:req.session.user,

        cashier

    });

};

exports.update=async(req,res)=>{

    try {

        await userService.update(req.params.id, req.body);
    
        if (req.body.password && req.body.password.trim() !== '') {
    
            await userService.updatePassword(
                req.params.id,
                req.body.password
            );
    
        }
    
        res.redirect('/users');
    
    } catch (err) {
    
        const cashier = await userService.getById(req.params.id);
    
        res.render('users/edit', {
            user: req.session.user,
            cashier,
            error: err.message
        });
    
    }
};

exports.deactivate = async (req, res) => {

    await userService.deactivate(req.params.id);

    res.redirect('/users');

};

exports.activate = async (req, res) => {

    await userService.activate(req.params.id);

    res.redirect('/users');

};