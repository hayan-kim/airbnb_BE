let accommodation = {};
accommodation["Vacancy"] = {1:true, 2:true, 3:true, 4:true, 5:true}
let requestDates = [1, 2, 3, 4, 5]

console.log (accommodation["Vacancy"])

let occupied = requestDates.reduce(
  (falseCount, item) =>
    accommodation["Vacancy"][item] === false ? falseCount++ : falseCount, 0);

let occ2 = requestDates.every(item => accommodation["Vacancy"][item])

console.log("occ2", occ2)
console.log ("occupied", occupied )

