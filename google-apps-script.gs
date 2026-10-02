const SHEET_ID = "12wiXS18mGf1h_xNTpyY_6P6beMd5uTWFTI7JfhO79HQ";
const SHEET_NAME = "Resources";

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    return output(e, { error: "Resources sheet not found" });
  }

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return output(e, []);

  const headers = values.shift().map(h => String(h).trim());
  const data = values
    .filter(row => row.some(v => String(v).trim() !== ""))
    .map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] || ""])));

  return output(e, data);
}

function output(e, data) {
  const requested = String((e && e.parameter && e.parameter.callback) || "callback");
  const callback = /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(requested) ? requested : "callback";
  return ContentService
    .createTextOutput(callback + "(" + JSON.stringify(data) + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}