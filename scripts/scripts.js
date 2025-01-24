$(document).ready(() => {
  const DIFFICULTE_FACILE = 0;
  const DIFFICULTE_MOYEN = 1;
  const DIFFICULTE_DIFFICILE = 2;
  const BOMBES = "💣";
  let grille;

  function nombreAleatoire(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  function genererGrille(nbLignes, nbColonnes) {
    grille = Array.from({ length: nbLignes }, () =>
      Array.from({ length: nbColonnes }, () => "0")
    );
  }

  function compterBombesVoisines(ligne, colonne) {
    let compte = 0;
    for (let l = ligne - 1; l < ligne + 1; l++) {
      for (let c = colonne - 1; c < colonne + 1; c++) {
        if (
          l < 0 ||
          l >= grille.length ||
          c < 0 ||
          c >= grille.length ||
          (l == ligne && c == colonne)
        )
          continue;
        if (grille[l][c] == BOMBES) compte++;
      }
    }
    return compte;
  }

  function ajouterBombes(difficilte) {
    const bombesList = [5, 30, 140];
    const bombes = bombesList[difficilte];

    let bombesPosition = Array(bombes);
    for (let index = 0; index < bombes; index++) {
      let pos;
      do {
        pos = nombreAleatoire(0, grille.length * grille.length - 1);
      } while (bombesPosition.includes(pos));
      bombesPosition[index] = pos;
    }

    for (const bombe of bombesPosition) {
      const lignes = Math.floor(bombe / grille.length);
      const colonnes = bombe % grille.length;
      grille[lignes][colonnes] = BOMBES;
    }

    for (let ligne = 0; ligne < grille.length; ligne++) {
      for (let colonne = 0; colonne < grille.length; colonne++) {
        if (grille[ligne][colonne] != BOMBES)
          grille[ligne][colonne] = compterBombesVoisines(ligne, colonne);
      }
    }
  }

  function afficherGrille() {
    const couleurs = [
      "lightgray",
      "blue",
      "green",
      "red",
      "purple",
      "maroon",
      "turquoise",
      "black",
      "darkgreen",
    ];
    let grilleJeu = $("#grille-jeu");
    grilleJeu.empty();
    for (const lignes of grille) {
      for (const element of lignes) {
        let newDiv = $("<div>" + element + "</div>");
        newDiv.addClass("item");
        const width = 500 / grille.length;
        newDiv.css("width", width + "px");
        newDiv.css("heigth", width + "px");
        if (element != BOMBES) newDiv.css("color", couleurs[element]);
        grilleJeu.append(newDiv);
      }
    }

    grilleJeu.css(
      "grid-template-columns",
      "repeat(" + grille.length + ", 1fr)"
    );
  }

  function nouvelleDifficulte(difficilte) {
    switch (difficilte) {
      case DIFFICULTE_FACILE:
        genererGrille(5, 5);
        break;
      case DIFFICULTE_MOYEN:
        genererGrille(10, 10);
        break;
      case DIFFICULTE_DIFFICILE:
        genererGrille(20, 20);
        break;
    }
    ajouterBombes(difficilte);
    afficherGrille();
  }

  $("#btn_facile").click(() => {
    nouvelleDifficulte(DIFFICULTE_FACILE);
  });
  $("#btn_moyen").click(() => {
    nouvelleDifficulte(DIFFICULTE_MOYEN);
  });
  $("#btn_difficile").click(() => {
    nouvelleDifficulte(DIFFICULTE_DIFFICILE);
  });
});
