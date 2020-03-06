const { init, format } = require("../../dist/index");
const fs = require("fs");

(async () => {
  await init(fs.readFileSync(require.resolve("../../dist/astyle.wasm")));
  const [success, result] = format("#include <cstdio>\nint main(){int 🦄,a,*b=a,c=🦄*2,*d=nullptr;return -1;}", "pad-oper style=google");
  console.log(result);
})();
