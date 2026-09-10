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
var VISITS_NAME = 'Visites';
var SUMMARY_NAME = 'Résumé';
var VISIT_HEADERS = ['Date', 'Langue', 'Appareil', 'Page'];
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

    // Compteur de scans : la page envoie type=visite à chaque première ouverture.
    if (p.type === 'visite') {
      getVisits().appendRow([new Date(), clean(p.langue) || 'fr', clean(p.appareil), clean(p.page)]);
      ensureSummary();
      return respond({ ok: true, visite: true });
    }

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

    ensureSummary();
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

function getVisits() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(VISITS_NAME) || ss.insertSheet(VISITS_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(VISIT_HEADERS);
    sheet.getRange(1, 1, 1, VISIT_HEADERS.length).setFontWeight('bold').setBackground('#003c38').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.setColumnWidths(1, VISIT_HEADERS.length, 160);
  }
  return sheet;
}

/** Onglet « Résumé » : scans, réponses et taux de conversion (formules, mis à jour tout seul). */
function ensureSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(SUMMARY_NAME)) return;
  var sheet = ss.insertSheet(SUMMARY_NAME, 0);
  sheet.getRange('A1:B4').setValues([
    ['Scans du code QR (visites de la page)', "=MAX(0;COUNTA(INDIRECT(\"'" + VISITS_NAME + "'!A2:A\")))"],
    ['Réponses au formulaire', "=MAX(0;COUNTA(INDIRECT(\"'" + SHEET_NAME + "'!A2:A\")))"],
    ['Taux de réponse', '=IF(B1=0;0;B2/B1)'],
    ['Dernier scan', "=IF(B1=0;\"—\";MAX(INDIRECT(\"'" + VISITS_NAME + "'!A2:A\")))"],
  ]);
  sheet.getRange('B3').setNumberFormat('0 %');
  sheet.getRange('B4').setNumberFormat('yyyy-mm-dd hh:mm');
  sheet.getRange('A1:A4').setFontWeight('bold');
  sheet.setColumnWidth(1, 320);
  sheet.setColumnWidth(2, 160);
}

function clean(v) {
  return v == null ? '' : String(v).trim().slice(0, 500);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
