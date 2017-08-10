//////////////// IMPORTS ///////////////////

const prepRepo = require('./prepRepo'),
      checkRepoStatus = require('./checkRepoStatus');

//////////////// PRIVATE ///////////////////

function generateFlower(repo) {
  prepRepo(repo)
  .then(checkRepoStatus)
  .then((repo) => {
    console.log("SUCCESS: " + repo.fullName);
  })
  .catch((err) => {
    console.log("ERROR:", err);
  });
}

//// IDEALLY ////
// function cloneFlower(repo) {
//   prepRepo(repo)
//   .then(checkRepoStatus)
//   .then(cloneRepo)
//   .then(createClocFile)
//   .then(convertClocFile)
//   .then(sendRepoData)
//   .then(deleteRepo)
//   .catch(err => {
//     switch(err.type) {

//     }
//   })
// }

/////////////////// EXPORTS ///////////////////

module.exports = generateFlower;

