//////////////// IMPORTS ///////////////////

const prepRepo = require('./prepRepo'),
      checkRepoStatus = require('./checkRepoStatus'),
      cloneRepo = require('./cloneRepo');

//////////////// PRIVATE ///////////////////

function generateFlower(repo) {
  prepRepo(repo)
  .then(checkRepoStatus)
  .then(cloneRepo)
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
//   .then(repoToCloc)
//   .then(clocToJson)
//   .then(returnRepoData)
//   .then(deleteRepo)
//   .catch(err => {
//     switch(err.type) {

//     }
//   })
// }

/////////////////// EXPORTS ///////////////////

module.exports = generateFlower;

