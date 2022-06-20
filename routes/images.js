const express = require("express");
const router = express.Router();
const Images = require("../models/image");
const upload = require("../modules/multer");

// router.post("/", upload.single("image"), async (req, res) => {
//   // modules/multer.js에 정의된 upload를 실행하여, 1개의 이미지 파일을 S3 버킷에 업로드한다.
//   // 업로드시 multer가 작성해주는 req.file의 정보에서, 이미지 파일의 url주소를 담은 "location" 값을 가져와서 리턴해준다.
//   // Images 모델로, DB에 사진 주소와 생성시점을 기록하고 있다. 
//   console.log(req.file);
//   const imageUrl = req.file.location;
//   const createdAt = new Date();

//   await Images.create({
//     imageUrl,
//     createdAt,
//   });

//   res.status(200).json({ imageUrl });
// });


// multer 관련 모듈이 작성 미완료라 서버가 제대로 작동하지 않아서 (로컬에서 node app.js 해보시면 서버 제대로 안켜짐) 일단 주석처리 합니다.
// router.post("/", upload.single("image"), (req,res) => {
//   res.send("good!")
// });

module.exports = router;
