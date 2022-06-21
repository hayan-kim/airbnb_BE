const express = require("express");
const router = express.Router();
const Images = require("../models/image");
const upload = require("../modules/multer");

router.post("/", upload.array("image", 5), async (req, res) => {
  // modules/multer.js에 정의된 upload를 실행하여, 1개의 이미지 파일을 S3 버킷에 업로드한다.
  // 업로드시 multer가 작성해주는 req.files의 정보에서, 이미지 파일의 url주소를 담은 "location" 값을 가져와서 리턴해준다.
  // 이미지가 여러개 들어오기 때문에 array 로 받아주고 각 이미지의 location을 찾아 db에 저장해준다.
  console.log(req.files);
  let imageUrls = new Array (req.files.length)
  for (i=0; i < req.files.length; i++){
    imageUrls[i] = req.files[i]["location"]
  }
  const createdAt = new Date();

  console.log(imageUrls)
  await Images.create({
    imageUrls,
    createdAt,
  });
  res.status(200).json({ imageUrls });
});



module.exports = router;
