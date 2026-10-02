const CONFIG = {
  SHEET_ID: "12wiXS18mGf1h_xNTpyY_6P6beMd5uTWFTI7JfhO79HQ",
  SHEET_NAME: "Resources",
  ROOT_FOLDER_NAME: "Myanmar ECE Archive",
  RESOURCE_FOLDER_NAME: "Resources"
};

function setupECEArchive() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  const headers = [
    "id","title","title_myanmar","description","audience","age",
    "domain","resource_type","language","author","created_at","drive_url"
  ];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
  } else {
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);

  const root = getOrCreateFolder(CONFIG.ROOT_FOLDER_NAME);
  getOrCreateFolderIn(root, CONFIG.RESOURCE_FOLDER_NAME);

  return "완료: Google Drive 폴더와 Resources 시트가 준비되었습니다.";
}

function getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function getOrCreateFolderIn(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function doGet(e) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return jsonp(e, {error:"Resources sheet not found"});
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return jsonp(e, []);
  const headers = values.shift().map(String);
  const data = values
    .filter(row => row.some(v => String(v).trim() !== ""))
    .map(row => Object.fromEntries(headers.map((h,i) => [h.trim(), row[i] || ""])));
  return jsonp(e, data);
}

function jsonp(e, data) {
  const requested = String((e && e.parameter && e.parameter.callback) || "callback");
  const callback = /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(requested) ? requested : "callback";
  return ContentService.createTextOutput(
    callback + "(" + JSON.stringify(data) + ");"
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}