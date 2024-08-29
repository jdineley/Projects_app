const xml2js = require("xml2js");
const fs = require("node:fs/promises");
const path = require("node:path");

async function msProjectExportXML(project, projectTasks) {
  const builder = new xml2js.Builder();
  const xml = builder.buildObject(JSON.parse(project.fileJSON));
  // console.log("xml", xml);
  console.log("project.file", project.file);
  try {
    console.log("__dirname", __dirname);
    await fs.writeFile(project.file, xml);
    // await fs.writeFile(
    //   path.join(__dirname + "/msProjectXMLDownloads/" + project.file),
    //   xml
    // );
    // console.log("downloadFile", downloadFile);
    const data = await fs.readFile(project.file);
    console.log(data.toString());

    // return downloadFile
  } catch (err) {
    console.log(err);
  }
}

module.exports = { msProjectExportXML };
