const rewire = require("rewire")
const main = rewire("./main")
const createWindow = main.__get__("createWindow")
// @ponicode
describe("createWindow", () => {
    test("0", () => {
        let callFunction = () => {
            createWindow()
        }
    
        expect(callFunction).not.toThrow()
    })
})
