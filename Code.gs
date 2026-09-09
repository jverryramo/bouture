/**
 * Ramo — réception des réponses du formulaire « Planter ma bouture »
 * (ramo.eco/bouture/ et /en/bouture/) dans une feuille Google Sheets.
 *
 * Déploiement : voir README.md dans ce dossier. En résumé : Extensions ›
 * Apps Script depuis la feuille, coller ce code, Déployer › Nouveau
 * déploiement › Application Web, « Exécuter en tant que : moi »,
 * « Accès : Tout le monde ». Copier l'URL /exec dans src/lib/bouture.ts.
 */

var SHEET_NAME = 'Réponses';
var HEADERS = [
  'Date',
  'Nom',
  'Courriel',
  'Enjeu 1',
  'Enjeu 2',
  'Enjeu 3',
  'Langue',
  'Source',
  'Page',
];

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var multi = (e && e.parameters) || {};

    // Piège à robots : champ caché qui doit rester vide.
    if (p._gotcha) return respond({ ok: true, ignored: true });

    var enjeux = multi.enjeux || (p.enjeux ? [p.enjeux] : []);
    enjeux = enjeux.filter(function (x) { return x && String(x).trim(); }).slice(0, 3);

    var nom = clean(p.nom);
    var courriel = clean(p.courriel);
    if (!nom || !courriel) return respond({ ok: false, error: 'nom et courriel requis' });

    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      nom,
      courriel,
      enjeux[0] || '',
      enjeux[1] || '',
      enjeux[2] || '',
      clean(p.langue) || 'fr',
      clean(p.source) || 'flyer-bouture',
      clean(p.page),
    ]);

    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

/** Test rapide dans le navigateur : l'URL /exec doit afficher {"ok":true,...}. */
function doGet() {
  return respond({ ok: true, service: 'ramo-bouture', sheet: SHEET_NAME });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var head = sheet.getRange(1, 1, 1, HEADERS.length);
    head.setFontWeight('bold').setBackground('#003c38').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.setColumnWidths(1, HEADERS.length, 180);
  }
  return sheet;
}

function clean(v) {
  return v == null ? '' : String(v).trim().slice(0, 500);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
