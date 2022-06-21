const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const User = require("../models/user");
const Accommodations = require("../models/accommodation");
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

//<-----전체 숙소 리스트 조회 API----->
router.get("/", async (req, res) => {
  //숙소들을 모두 보여준다.
  const accommodations = await Accommodations.find().exec();
  res.json({
    accommodations,
  });
});

//<-----기간으로 검색  API-----> 
// 현재 SA의 API 문서에는 없는데 아무래도 추가하고 싶을 것 같음. 일단 기간 기준 검색부터 작성.
router.get("/searchByPeriod", async (req, res) => {
  const { tripStart, tripEnd } = req.body;
  const targetAccommodations = await Accommodations.find({
    $and: [{ openAt: { $lte: tripStart } }, { closeAt: { $gte: tripEnd } }],
  });
  res.json({
    targetAccommodations,
  });
});

//<-----숙소정보 상세 조회 API----->
router.get("/:accId", async (req, res) => {
  const { accId } = req.params;
  const accommodation = await Accommodations.findOne({ accId });
  res.json({
    accommodation,
  });
});

//<-----숙소정보 카테고리별 조회 API----->
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  const accommodations = await Accommodations.find({ category });
  res.json({
    accommodations,
  });
});


//<-----숙소 정보 작성 API----->

function createVacancy (openDays, openAt) {
  let Vacancy = {};

  for (let i = 1; i <= openDays; i++) {
    let humanDate = new Date(openAt + 86400000 * (i - 1));
    console.log (humanDate);
    Vacancy[humanDate] = true;
  }
  return Vacancy;
}


router.post("/", authMiddleware, async (req, res) => {   
  //작성자의 userId를 숙소 정보와 함께 DB에 저장
  const userId = res.locals.user.userId;  
  const {    
    photos,
    category,
    accName,
    openAt,
    closeAt,
    address,
    desc1_hanmadi,
    desc2_surroundings,
    desc3_notice,
    desc4_basics,
    facilities,
    charge,
  } = req.body;

  if (
    !photos ||
    !category ||
    !accName ||
    !openAt ||
    !closeAt ||
    !address ||
    !desc1_hanmadi ||
    !desc2_surroundings ||
    !desc3_notice ||
    !desc4_basics ||
    // !facilities ||
    !charge
  ) {
    return res.status(400).json({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }

  //accId를 자동으로 생성하며, 1씩 증가하게 카운팅해준다.
  let counter = await Counters.findOne({ name: "Accommodations" }).exec();
  if (!counter) {
    counter = await Counters.create({ name: "Accommodations", count: 0 });
  }
  counter.count++;
  counter.save();
  let accId = counter.count;

  // 예약가능기간(openAt ~ closeAt)의 각 날짜들을 key로, 예약가능여부를 value로(boolean) 갖는 "공실 객체" Vacancy 생성
  const openDays = (closeAt - openAt) / 86400000 + 1;
  let Vacancy = await createVacancy(openDays, openAt);
  
  // for (let i = 1; i <= openDays; i++) {
  //   let humanDate = new Date(openAt + 86400000 * (i - 1));
  //   console.log (humanDate);
  //   Vacancy[humanDate] = true;
  // }
  
  console.log(Vacancy)

  await Accommodations.create({
    accId,
    userId,
    photos,
    category,
    accName,
    openAt,
    closeAt,
    Vacancy,
    address,
    desc1_hanmadi,
    desc2_surroundings,
    desc3_notice,
    desc4_basics,
    facilities,
    charge,
  });

  res.status(200).json({ message: "숙소 정보를 등록했습니다." });
});

//<----숙소정보 수정 API----->
router.put("/:accId", authMiddleware, async (req, res) => { 
  const userId = res.locals.user.userId;
  const { accId } = req.params;
  const {    
    photos,
    category,
    accName,
    openAt,
    closeAt,
    address,
    desc1_hanmadi,
    desc2_surroundings,
    desc3_notice,
    desc4_basics,
    facilities,
    charge,
  } = req.body;

  const existAccommodation = await Accommodations.findOne({ accId });

  if (
    !photos ||
    !category ||
    !accName ||
    !openAt ||
    !closeAt ||
    !address ||
    !desc1_hanmadi ||
    !desc2_surroundings ||
    !desc3_notice ||
    !desc4_basics ||
    // !facilities ||
    !charge
  ) {
    return res.status(400).json({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }

  // 수정글을 작성하면서 사진 이미지도 새로 올렸다면(= imageUrl 값이 바뀌었다면)
  // 해당 게시글과 함께 S3에 올렸던 이미지 파일도 삭제
  // .split은 bucket 내의 경로를 생성하기 위함.
  // Images DB 에서도 정보 삭제

  // if (existArticles.imageUrl === imageUrl) {

  //   s3.deleteObject({
  //     Bucket : 'hh99-6th',
  //     Key : existArticles.imageUrl.split(".com/",2)[1]
  //   }, function(err, data){});

  //   await Images.deleteOne({
  //     imageUrl : existArticles.imageUrl
  //   })
  // }

  if (userId === existAccommodation["userId"]) {
    //현재 로그인한 사용자가 숙소를 등록한 사용자라면 숙소 정보 수정을 실행한다.

    // 예약가능기간(openAt ~ closeAt)의 각 날짜들을 key로, 예약가능여부를 value로(boolean) 갖는 "공실 객체" Vacancy 생성
    const openDays = (closeAt - openAt) / 86400000 + 1;
    let Vacancy = {};
    for (let i = 1; i <= openDays; i++) {
      let humanDate = new Date(openAt + 86400000 * (i - 1));
      Vacancy[humanDate] = true;
    }

    await Accommodations.updateOne(
      { accId },
      {
        $set: {
          accId,
          userId,
          photos,
          category,
          accName,
          openAt,
          closeAt,
          Vacancy,
          address,
          desc1_hanmadi,
          desc2_surroundings,
          desc3_notice,
          desc4_basics,
          facilities,
          charge,
        },
      }
    );
    res.status(200).json({ message: "숙소 정보를 수정했습니다." });
  } else {
    return res
      .status(400)
      .json({ errorMessage: "등록자만 수정할 수 있습니다." });
  }
});

//<-----숙소 정보 삭제 API----->
router.delete("/:accId", authMiddleware, async (req, res) => {
  const { accId } = req.params;
  const userId = res.locals.user.userId;
  const existAccommodation = await Accommodations.findOne({ accId });

  if (userId === existAccommodation["userId"]) {
    await Accommodations.deleteOne({ accId });

    // 해당 게시글과 함께 S3에 올렸던 이미지 파일도 삭제
    // .split은 bucket 내의 경로를 생성하기 위함.
    // s3.deleteObject(
    //   {
    //     Bucket: "hh99-6th",
    //     Key: article.imageUrl.split(".com/", 2)[1],
    //   },
    //   function (err, data) {}
    // );

    // Images DB 에서도 정보 삭제
    // await Images.deleteOne({
    //   imageUrl: article.imageUrl,
    // });

    res.status(200).json({
      message: "숙소 정보를 삭제했습니다.",
    });
  } else {
    return res.status(400).send({
      errorMessage: "등록자만 삭제할 수 있습니다.",
    });
  }
});

module.exports = router;
