# Planter ma bouture — landing du flyer Ramo

Page unique (`index.html`), hébergée sur GitHub Pages. Le code QR du flyer
pointe vers cette page. Le visiteur donne son nom, son courriel et décrit jusqu'à
3 enjeux (municipalité, matières résiduelles), puis le guide s'affiche.

## Recevoir les réponses dans un Google Sheet (10 min, une seule fois)

1. Sur drive.google.com : **Nouveau › Google Sheets**. Nommez la feuille
   (ex. « Réponses flyer bouture ») et partagez-la avec l'équipe.
2. Dans la feuille : **Extensions › Apps Script**. Remplacez le contenu de
   `Code.gs` par le fichier [`Code.gs`](./Code.gs) de ce dépôt. Enregistrez.
3. **Déployer › Nouveau déploiement** › type *Application Web* :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
   Cliquez *Déployer* et autorisez le script (bouton *Paramètres avancés ›
   Accéder à …* si un avertissement apparaît : c'est votre propre script).
4. Copiez l'URL qui se termine par `/exec`. Collée dans un navigateur, elle
   doit afficher `{"ok":true,...}`.
5. Dans ce dépôt, ouvrez `index.html`, cliquez sur le crayon (modifier),
   cherchez la ligne `var SHEET_URL = '';` et collez l'URL entre les
   guillemets. *Commit changes*. La page se met à jour en une minute.

Tant que `SHEET_URL` est vide, les réponses partent vers le formulaire
Formspree du site ramo.eco (même boîte que « Nous joindre »).

Colonnes de la feuille : Date, Nom, Courriel, Enjeu 1, Enjeu 2, Enjeu 3,
Langue, Source, Page.

## Modifier le texte

Tout est dans `index.html` : titres, questions, question sur les enjeux (bloc
`<fieldset>`), les six étapes (`<ol class="steps">`). Modifiez dans GitHub
(crayon) puis *Commit changes*.
