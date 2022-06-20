const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

//AWS S3에 접근하기 위한 정보는 gitHub에 올라가지 않는 파일에 따로 은닉함. (dotenv)
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region : 'ap-northeast-2'
})

// // routes/images.js 에서 실행할 "upload" 함수를 multer를 이용해 만들어준다. 
// // key 설정에서 파일을 업로드할 S3 버킷 내의 폴더 경로를 지정하고, 파일명 앞에 생성시점을 붙여 고유성을 확보한다. 
// const s3 = new aws.S3();
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'airbnb99',  // S3 bucket 이름 제대로 넣어주기
//     acl: 'public-read',
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: function (req, file, cb) {
//       cb(null, `shop_adv/${Date.now()}_${file.originalname}`);
//     },
//   })
// });

const s3 = new aws.S3();

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp'];

const update = multer({
  storage: multerS3({
    s3:s3,
    bucket: 'airbnb99',
    key: (req, file, cb) =>{
      const uploadDirectory = req.query 
    }
  })
})



// multer 관련 모듈이 작성 미완료라 서버가 제대로 작동하지 않아서 (로컬에서 node app.js 해보시면 서버 제대로 안켜짐) 일단 주석처리 합니다.
// module.exports = upload;