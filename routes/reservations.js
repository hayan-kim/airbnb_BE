const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Accommodation = require("../models/accommodation");
const Reservation = require("../models/reservation");
const Images = require("../models/image");
const Counters = require("../models/counter");
const router = express.Router();


//<-----사용자 예약 조회 (마이페이지)----->

router.get("/:userId", authMiddleware, async (req, res) => {  //authMiddleware,
  const userId = req.params

  //게시글들을 내림차순으로 정렬해서 보여준다.
  const reservations = await Reservation.find({ userId }); 
  res.json({
    reservations,
  });
});


//<-----예약 상세 조회(?)----->
router.get("/:revId", authMiddleware, async (req, res) => {  //authMiddleware, 
  const revId = req.params;
  const reservation = await Reservation.findOne({ revId });
      
  res.json({
    reservation,
  });
});


//<-----예약 작성 API----->

// 호스트는, 특정 숙소를 등록한 상태에서 예약가능기간을 계속 반복해서, 그러나 동시에 단 한 건씩만 "오픈"할 수 있다. 
// 1. 예약가능일은 6월 1일 ~ 6월 7일 과 같은 짧은 기간으로 등록한다.
// 2. 6월 1일 ~ 6월 7일 사이의 "일부 기간라도" 즉 6월 3일 ~ 6월 4일 같은 기간이라도 예약되면 "해당 오픈 건은 종료"이다.
// 2-1. 따라서 Accommodation의 예약가능기간을 나타내는 (openAt ~ closeAt) 두 변수는 예외적인 값, 즉 현재보다 이미 과거의 날짜로 처리해준다. (1050418800000 = 2003.4.16)
//      frontend에서 이 값을 받으면 "예약 불가"로 보여줘야 한다. *openAt, closeAt은 Date 자료형을 갖는 변수이기 때문이다. DB Model로 고정해두었음.
// 2-2. 귀찮지만 이미 예약된 날짜를 제외하고 가능일을 다시 등록하는 것은 호스트의 몫인 것으로...

// 예약 날짜가 가능한 날짜인지 확인해야 한다. 
// 1. Accommodation의 openAt, closeAt 사이에 들어와야 한다. 

router.post("/:accId", authMiddleware, async (req, res) => {  
  const { accId } = req.params;  
  const accommodation = await Accommodation.findOne({ accId })
  const accName = accommodation["accName"] 
  const {  checkIn, checkOut, guests, charge, totalCharge } = req.body; 
  const userId = res.locals.user.userId;   
  
  if ( !checkIn || !checkOut || !guests || !charge || !totalCharge ) {
    return res.status(400).json({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  } 

  if (checkIn < accommodation["openAt"] || checkOut > accommodation["closeAt"])  {
    return res.status(400).json({
      errorMessage: "예약이 불가능한 날짜가 포함되었습니다.",
    });
  }
  
 //위 조건들을 통과하면 예약이 가능하다. 예약 절차를 실행. 
 //revId를 카운팅하며 생성한다. 
  let counter = await Counters.findOne({ name: "Reservations" }).exec();
  if (!counter) {
    counter = await Counters.create({ name: "Reservations", count: 0 }); 
  }
  counter.count++;
  counter.save();
  let revId = counter.count;    

  const reservation = await Reservation.create({
    revId,
    accId,
    userId,
    accName,
    checkIn,
    checkOut,
    guests,
    charge,
    totalCharge    
  }); 

  const openAt = 1050418800000
  const closeAt = 1050418800000

  await Accommodation.updateOne(   
    { accId },
    { $set: { openAt, closeAt } }
  );

  res
    .status(200)
    .json({ message: "예약하셨습니다." }); 
});


//<-----예약 취소 API----->
router.delete("/:revId", authMiddleware, async (req, res) => {
  const { revId } = req.params;
  const userId = res.locals.user.userId
  const reservation = await Reservation.findOne({ revId });
  
  if ( userId === reservation["userId"]) { 
    await Reservation.deleteOne({ revId });        
    res.status(200).json({ 
      message: "예약을 취소하셨습니다.", 
    });      
  }  
});

module.exports = router;