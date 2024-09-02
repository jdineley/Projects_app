const xml2js = require("xml2js");
const fs = require("node:fs/promises");
const path = require("node:path");

async function msProjectExportXML(project, projectTasks) {
  console.log("hit msProjectExportXML util");
  // console.log("projectTasks", projectTasks);
  // to do:
  // 1. Convert project.fileJSON into a JS object
  // 2. Loop over project.fileJSON against projectTask to change:
  //    - Percentage complete
  //    - Description

  const msProjectObj = JSON.parse(project.fileJSON);

  for (const task of msProjectObj.Project.Tasks[0].Task) {
    const activeTask = projectTasks.find(
      (el) => el.msProjectGUID === task.GUID[0]
    );
    if (activeTask) {
      task.PercentWorkComplete = [`${activeTask.percentageComplete}`];
      task.Notes = [activeTask.description];
    }
  }

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(msProjectObj);

  try {
    await fs.writeFile(project.file, xml);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { msProjectExportXML };
