const express=require('express')
const router=express.Router()
const User1=require('../models/User1')
const bcyrpt=require('bcryptjs')
const jwt=require('jsonwebtoken')

router.get('/',async (req,res)=>{
    try{
        const users=await User1.find();
        res.status(200).json(users) 
    }catch(err){
        res.status(500).json({message:"internal server error"})
    }
})

router.get('/:id',async (req,res)=>{
    try{
        const user=await User1.findById(req.params.id);
        res.status(200).json(user) 
    }catch(err){
        res.status(500).json({message:"internal server error"})
    }
})

router.post('/signup/',async (req,res)=>{
    try{
        const {userId,name,password,flatNo}=req.body
        if (!userId || !name || !password || !flatNo){
           return res.status(400).json({message:"include all the fields!"})
        }
        const user=new User1({userId,name,password:await bcyrpt.hash(password,10),flatNo})
        await user.save()
        res.status(200).json({message:"User Created Successfully"}) 
    }catch(err){
        res.status(500).json({message:"internal server error"})
    }
})

router.post('/login/',async (req,res)=>{
   try{
        const {userId,password}=req.body;
        if(!userId || !password){
            return res.status(400).json({message:"include all the fields!"})
        }
        const user=await User1.findOne({userId:userId})
        if(!user || !(await bcyrpt.compare(password,user.password))){
            return res.status(404).json({message:"Invalid Credentials!"})
        }
        const token=jwt.sign({id:user._id,password},process.env.JWT_SECRET)
        res.status(200).json({token,user,type:"tenant"});


   }catch(err){
        res.status(500).json({message:"internal server error"})
   }
})



router.delete('/:id',async ()=>{
    try{
        await User1.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"deleted successfully!"})
    }catch(err){
        res.status(500).json({message:"internal server error"})
    }
})

module.exports=router;