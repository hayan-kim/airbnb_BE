const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const User = require("../models/user");
const Review = require("../models/review");
const Images = require("../models/image");
const Counters = require("../models/counter");
const router = express.Router();


const aws = require("aws-sdk");
const s3 = new aws.S3(); 
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
  });


    //리뷰 조회
    router.get("/:accId", async (req,res) => {
        const { accId } = req.params;
        const review = await Review.find({ accId });
        res.json({
            review,
        });
    });

  //리뷰 작성
  router.post("/:accId", authMiddleware, async (req,res) =>{
      const { accId } = req.params;
      const userId = res.locals.user.userId;
      const createdAt = new Date(); 
      console.log(createdAt)
      const {
          photos,
          content,
          stars,
      } = req.body

      //reviewId 자동 카운팅
    let counter = await Counters.findOne({ name: "Review" }).exec();
    if (!counter) {
        counter = await Counters.create({ name: 'Review', count: 0 });
    }
    counter.count++;
    counter.save();
    let reviewId = counter.count;

    if(
        !photos ||
        !content ||
        !stars 
        )
     {
        return res.status(400).json({
            errorMessage: "작성란을 모두 입력해주세요."
        });
    }

    await Review.create({
        accId,
        userId,
        reviewId,
        photos,
        content,
        stars,
        createdAt,
    });

    res.status(200).json({ message: "리뷰작성을 완료하였습니다." })
  });


// 리뷰 수정 
router.put("/:reviewId", authMiddleware, async (req,res) =>{
    const userId = res.locals.user.userId;
    const { reviewId } = req.params;
    const {
        photos,
        content,
        stars,
     } = req.body;

     const existreview = await Review.findOne({ reviewId });

     if(
         !photos ||
         !content ||
         !stars
     ){
         return res.status(400).json({
             errorMessage: "작성란을 모두 입력해주세요.",
         });
     }


     if(userId === existreview["userId"]){
         await Review.updateOne(
             { reviewId },
             { $set: {
                 reviewId,
                 userId,
                 photos,
                 content,
                 stars,
             }, 
            }
         );
         res.status(200).json({ message: "리뷰를 수정했습니다." });
     }else{
         return res.status(400).json({ errorMessage: "등록자만 수정할 수 있습니다." });
     }
});

//리뷰 삭제
//일단 제대로 메칭이 안되는거 같다.

router.delete("/:reviewId", authMiddleware, async (req,res) => {
    const { reviewId } = req.params;
    const userId = res.locals.user.userId; 
    const existreview = await Review.findOne({ reviewId });
    console.log( reviewId,userId,existreview )
    if(userId === existreview["userId"]){
        await Review.deleteOne({ reviewId });

        res.status(200).json({
            message: "리뷰를 삭제했습니다."
        });
    }else{
        return res.status(400).send({
            errorMessage: "등록자만 삭제할 수 있습니다."
        });
    }
});


module.exports = router;