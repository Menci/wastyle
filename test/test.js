const fs = require("fs");
const expect = require("chai").expect;
const wastyle = require("..");

async function test(file) {
  await wastyle.init(fs.readFileSync(require.resolve(file)));

  const code = "#include <cstdio>\nint main(){int 🦄,a,*b=a,c=🦄*2,*d=nullptr;return -1;}";
  const options = "pad-oper style=google";

  const [success, result] = wastyle.format(code, options);
  expect(success).to.be.true;
  expect(result).to.be.equals(
    "#include <cstdio>\nint main() {\n    int 🦄, a, *b = a, c = 🦄 * 2, *d = nullptr;\n    return -1;\n}"
  );
}

it("Formatter (compiled with -O3) should work", async () => {
  await test("../dist/astyle.wasm");
});

it("Formatter (compiled with -Os) should work", async () => {
  await test("../dist/astyle-optimize-size.wasm");
});
