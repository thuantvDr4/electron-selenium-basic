//selenium
const { Builder, By, Key, until } = require("selenium-webdriver");

async function login() {
  //selenium
  const driver = new Builder().forBrowser("chrome").build();
  //
  try {
    await driver.get(
      "https://rori4.github.io/selenium-practice/#/pages/practice/simple-registration"
    );

    await driver.findElement(By.name("email")).sendKeys("thuancafe@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("12341234");
    await driver.findElement(By.id("submit")).click();
  } catch (err) {
    console.log(err);
  }
}

//getRows
const getRowData = async (driver) => {
  let result = [];
  try {
    let rows = await driver.findElements(By.xpath("//tbody/tr"));
    //loop to rows
    for (const row of rows) {
      const rowData = await row.getText();
      const user = rowData.split(/\n/);

      result.push({
        id: user[0],
        firstName: user[1],
        lastName: user[2],
        userName: user[3],
        email: user[4],
        age: user[5],
      });
    }
    //
    return result;
  } catch (err) {
    console.log(err);
    return [];
  }
};

//
async function tableExtract() {
  const driver = new Builder().forBrowser("chrome").build();
  //
  let results = [];
  try {
    await driver.get(
      "https://rori4.github.io/selenium-practice/#/pages/tables/smart-table"
    );
    //loop-page to page
    for (let i = 1; i < 6; i++) {
      //
      const rowData = await getRowData(driver);
      results = results.concat(rowData);
      //go-next
      await driver.findElement(By.css(".page-link-next")).click();
      //
    }
    // console.table(results);
    return results;
  } catch (err) {
    console.log(err);
  }
}

//

//
module.exports = { login, tableExtract };
