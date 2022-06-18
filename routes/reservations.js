const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Accommodations = require("../models/accommodation");
const Reservations = require("../models/reservation");
const Images = require("../models/image");
const Counters = require("../models/counter");
const router = express.Router();

//<-----사용자 예약 조회 (마이페이지)----->

router.get("/:userId", authMiddleware, async (req, res) => {
  
  const userId = req.params;
  const reservations = await Reservations.find({ userId });

  res.json({
    reservations,
  });
});

//<-----예약 상세 조회(?)----->
router.get("/:revId", authMiddleware, async (req, res) => {
  
  const revId = req.params;
  const reservation = await Reservations.findOne({ revId });

  res.json({
    reservation,
  });
});

//<-----예약 작성 API----->
router.post("/:accId", async (req, res) => {  //authMiddleware, 
  
  const { accId } = req.params;
  const accommodation = await Accommodations.findOne({ accId });
  const accName = accommodation["accName"];
  const { userId, checkIn, checkOut, guests, charge, totalCharge } = req.body; //userId 로그인 되면 빼기
  //const userId = res.locals.user.userId;

  if (!checkIn || !checkOut || !guests || !charge || !totalCharge) {
    return res.status(400).json({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }

  // 예약 기간 자체가 오픈 기간과 맞지 않다면 에러 처리.
  if (
    checkIn < accommodation["openAt"] ||
    checkOut > accommodation["closeAt"]
  ) {
    return res.status(400).json({
      errorMessage: "예약이 불가능한 날짜가 포함되었습니다.",
    });
  }

  // 예약 기간의 각 날짜들을 요소로 갖는 "예약일 배열"을 생성한다.
  let Dates = new Array((checkOut - checkIn) / 86400000 + 1).fill("init");
  let requestDates = Dates.map(
    (item, index) => (item = new Date(checkIn + 86400000 * index))
  );

  // 예약일 배열의 날짜들 중에서, 예약 대상 숙소의 예약가능일 객체(Vacancy)에 false로 표기된 날짜가 있는지 검사한다.
  let availability = requestDates.every(
    (item) => accommodation["Vacancy"][item]
  );

  if (!availability) {
    return res.status(400).json({
      errorMessage: "예약이 불가능한 날짜가 포함되었습니다.",
    });
  }

  // 위 조건들을 모두 통과하면 예약이 가능하다. 예약 절차 (1) ~ (3) 실행.

  // (1) 숙소 정보의 예약가능객체 Vacancy에서 지금 예약하는 날짜들은 false로 바꿔준다.
  requestDates.forEach((item) => (accommodation["Vacancy"][item] = false));
  await Accommodations.updateOne(
    { accId },
    { $set: { Vacancy: accommodation["Vacancy"] } }
  );

  // (2) 예약고유번호 revId를 카운팅하며 생성한다.
  let counter = await Counters.findOne({ name: "Reservations" }).exec();
  if (!counter) {
    counter = await Counters.create({ name: "Reservations", count: 0 });
  }
  counter.count++;
  counter.save();
  let revId = counter.count;

  // (3) DB에 예약정보를 등록한다.
  const reservation = await Reservation.create({
    revId,
    accId,
    userId,
    accName,
    checkIn,
    checkOut,
    guests,
    charge,
    totalCharge,
  });

  res.status(200).json({ message: "예약하셨습니다." });
});

// <-----예약 취소 API----->
router.delete("/:revId",  async (req, res) => { //authMiddleware,
  
  const { revId } = req.params;
  // const userId = res.locals.user.userId;
  const {userId} = req.body; // 로그인 사용시 제거할 것
  const reservation = await Reservations.findOne({ revId });
  let accommodation = await Accommodations.findOne({
    accId: reservation["accId"],
  });

  if (userId === reservation["userId"]) {
    // 예약했던 날짜들을 요소로 갖는 배열 생성
    let Dates = new Array(
      (reservation["checkOut"] - reservation["checkIn"]) / 86400000 + 1
    ).fill("init");
    let reservedDates = Dates.map(
      (item, index) =>
        new Date(Date.parse(reservation["checkIn"]) + 86400000 * index)
    );

    // 예약했던 날짜들을 숙소정보 DB의 Vacancy 객체에서 "true"로 돌려줌
    reservedDates.forEach((item) => {
      accommodation["Vacancy"][item] = true;
    });

    await Accommodations.updateOne(
      { accId: reservation["accId"] },
      { $set: { Vacancy: accommodation["Vacancy"] } }
    );

    // 예약 정보를 DB에서 삭제함.
    await Reservations.deleteOne({ revId });
    res.status(200).json({ message: "예약을 취소하셨습니다." });
  } else {
    res.status(401).json({ message: "예약자만 취소할 수 있습니다." });
  }
});

module.exports = router;