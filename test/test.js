const fs = require("fs");
const expect = require("chai").expect;
const wastyle = require("..");

it("Formatter should work", async () => {
  await wastyle.init(fs.readFileSync(require.resolve("../dist/astyle.wasm")));

  const code = "#include <cstdio>\nint main(){int 🦄,a,*b=a,c=🦄*2,*d=nullptr;return -1;}";
  const options = "pad-oper style=google";

  const [success, result] = wastyle.format(code, options);
  expect(success).to.be.true;
  expect(result).to.be.equals(
    "#include <cstdio>\nint main() {\n    int 🦄, a, *b = a, c = 🦄 * 2, *d = nullptr;\n    return -1;\n}"
  );
});
