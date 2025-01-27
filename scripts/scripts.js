$(document).ready(() => {
  const DIFFICULTE_FACILE = 0;
  const DIFFICULTE_MOYEN = 1;
  const DIFFICULTE_DIFFICILE = 2;
  const BOMBES = "💣";
  const DRAPEAU = "🚩";
  const REVEAL_COLOR = "rgb(255, 255, 255)";
  let partieEnCours = false;
  let grille = [];

  function nombreAleatoire(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }

  function genererGrille(nbLignes, nbColonnes) {
    grille = Array.from({ length: nbLignes }, () =>
      Array.from({ length: nbColonnes }, () => "0")
    );
  }

  function obtenirVoisins(ligne, colonne, diagonal) {
    let voisins = [];
    for (let l = ligne - 1; l < ligne + 2; l++) {
      if (l < 0 || l >= grille.length) continue;
      for (let c = colonne - 1; c < colonne + 2; c++) {
        if (c < 0 || c >= grille.length || (l == ligne && c == colonne)) {
          continue;
        }
        if (!diagonal && Math.abs(l - ligne) + Math.abs(c - colonne) > 1)
          continue;
        voisins.push({ ligne: l, colonne: c });
      }
    }
    return voisins;
  }

  function compterBombesVoisines(ligne, colonne) {
    let compte = 0;
    const voisins = obtenirVoisins(ligne, colonne, true);
    for (const voisin of voisins) {
      if (grille[voisin.ligne][voisin.colonne] == BOMBES) compte++;
    }
    return compte;
  }

  function estVoisinDejaPresent(arr, voisin) {
    return arr.some(
      (item) => item.ligne === voisin.ligne && item.colonne === voisin.colonne
    );
  }

  function obtenirCoordonneesZoneDiffusion(ligne, colonne) {
    if (grille[ligne][colonne] == BOMBES) return null;
    let P = [{ ligne: ligne, colonne: colonne }];
    let B = [];
    let C = [];
    do {
      const n = P.pop();
      B.push(n);
      const voisins = obtenirVoisins(n.ligne, n.colonne);
      for (const voisin of voisins) {
        if (grille[voisin.ligne][voisin.colonne] === 0) {
          if (
            !estVoisinDejaPresent(P, voisin) &&
            !estVoisinDejaPresent(B, voisin)
          ) {
            P.push(voisin);
          }
        } else if (grille[voisin.ligne][voisin.colonne] != BOMBES) {
          if (!estVoisinDejaPresent(C, voisin)) C.push(voisin);
        }
      }
    } while (P.length !== 0);
    return B.concat(C);
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

  function revelezBombes(color) {
    $(".bombe").css("background-color", color);
    $(".bombe").text(BOMBES);
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

    const width = 500 / grille.length;
    for (let ligne = 0; ligne < grille.length; ligne++) {
      for (let colonne = 0; colonne < grille.length; colonne++) {
        let element = grille[ligne][colonne];
        let newDiv = $("<div></div>");
        newDiv.addClass("item");
        if (element == BOMBES) newDiv.addClass("bombe");
        newDiv.css("width", width + "px");
        newDiv.css("max-height", width + "px");
        newDiv.data("ligne", ligne);
        newDiv.data("colonne", colonne);
        if (element != BOMBES) newDiv.css("color", couleurs[element]);

        newDiv.click(function () {
          if (!partieEnCours) {
            return alert(
              "La partie est terminée. Cliquez sur une difficulté pour recommencer."
            );
          }
          const zone = obtenirCoordonneesZoneDiffusion(ligne, colonne);
          if (zone === null) {
            partieEnCours = false;
            revelezBombes("red");
            setTimeout(() => alert("Vous avez perdu!!"), 0);
            return;
          }

          const items = $(".item");

          for (const element of zone) {
            items
              .filter(function () {
                return (
                  $(this).data("ligne") == element.ligne &&
                  $(this).data("colonne") == element.colonne
                );
              })
              .css("background-color", REVEAL_COLOR)
              .text(grille[element.ligne][element.colonne]);
          }

          // Doit attendre pour que le DOM sois mis à jours. Sinon nous récuperont l'ancien comptes.
          setTimeout(function () {
            const remaining = items.filter(function () {
              return (
                $(this).text() !== BOMBES &&
                $(this).css("background-color") != REVEAL_COLOR
              );
            }).length;
            if (!remaining) {
              revelezBombes("green");
              partieEnCours = false;
              setTimeout(() => alert("Vous avez gagnez!!"), 0);
            }
          }, 0);
        });

        newDiv.on("contextmenu", function (event) {
          event.preventDefault();
          if (newDiv.css("background-color") != REVEAL_COLOR)
            newDiv.text(newDiv.text() === DRAPEAU ? "" : DRAPEAU);
        });

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
    partieEnCours = true;
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
