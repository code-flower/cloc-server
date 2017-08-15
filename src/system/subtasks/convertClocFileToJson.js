//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function dummyData() {
  let data = { arr: [] };
  for (let i = 0; i < 50; i++)
    data.arr.push({
      "number": i,
      "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vestibulum quis urna vel feugiat. Phasellus euismod eu nisl quis rutrum. Duis fringilla rhoncus augue vitae laoreet. Curabitur volutpat nisl sit amet gravida pretium. Mauris tempor, ante quis consectetur porttitor, turpis arcu pulvinar elit, ac efficitur nisl ipsum at ante. Etiam porta ultrices enim, id aliquam est dignissim at. Vivamus dapibus ullamcorper mauris sed dignissim. Donec ornare sit amet purus in gravida. Mauris faucibus, ipsum sit amet consectetur facilisis, nibh turpis tincidunt augue, sit amet consectetur felis lacus non risus. Sed venenatis, lectus in semper vehicula, dui nisl sagittis tortor, et commodo sem lacus iaculis eros. Nam dapibus placerat ante, quis mattis lorem scelerisque et. Aliquam ac eros posuere, placerat nisl ac, tincidunt magna. Pellentesque at lacus vitae velit fringilla imperdiet et eget turpis. Morbi nec euismod diam. Mauris eu augue sit amet tortor cursus tristique nec a enim. Phasellus blandit consectetur enim at placerat."
    });
  return data;
}

function convertClocFileToJson(ctrl) {
  return new Promise((resolve, reject) => {
    console.log("5. Converting Cloc File To Json");

    ctrl.repo.cloc = {
      flower: dummyData(),
      ignored: 'ignored files'
    };

    resolve(ctrl);
  });
}

//////////// EXPORTS //////////////

module.exports = convertClocFileToJson;

// let repo = { 
//   owner: 'code-flower',
//   name: 'client-web',
//   branch: 'new-ui',
//   uid: '14420_0',
//   fullName: 'code-flower/client-web',
//   folderName: 'code-flower#client-web#16011_0' 
// };

//convertClocFileToJson(repo);