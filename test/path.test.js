import path from "../src/lib/utils/Path";

test("path -> dirname", () => {
  const dirname = path.dirname("/dir/dir2/dir3/demo.txt");
  expect(dirname).toBe("/dir/dir2/dir3");
});

test("path -> join", () => {
  const joinedPath = path.join("app/src/css/master.css", "../../js/main.js");
  expect(joinedPath).toBe("app/src/js/main.js");
});