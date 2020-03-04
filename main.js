
function hideIfEmpty(elem) {
    if (elem.innerHTML === "")
        elem.setAttribute("hidden","");
    else
        elem.removeAttribute("hidden");
}
function getValidator(type) {
    switch (type) {
        case "port":
            return function(form) {
                const nbPort = parseInt(form.elements.nbPort.value);
                const nbChenaux = parseInt(form.elements.nbChenaux.value);
                const nbPaires = parseInt(form.elements.nbPaires.value);
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (nbChenaux > nbPort)
                    errMes.innerHTML += "<li>+ de gobelets sur les chenaux que dans le port</li>";
                if (2*nbPaires > nbChenaux)
                    errMes.innerHTML += "<li>+ de paires comptées que de paires possibles avec les gobelets des chenaux</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : nbPort + nbChenaux + 2*nbPaires);
            };
        case "mancheaair":
            return function(form) {
                const nbManchesaAir = parseInt(form.elements.nbManchesaAir.value);
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (nbManchesaAir < 0)
                    errMes.innerHTML += "<li>Nombre de manches à air &lt; 0</li>";
                else if (nbManchesaAir > 2)
                    errMes.innerHTML += "<li>Nombre de manches à air &gt; 2</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : [0,5,15][nbManchesaAir]);
            };
        case "phare":
            return function(form) {
                const phareDepose = form.elements.phareDepose.checked;
                const phareActif = form.elements.phareActif.checked;
                const phareCorrect = form.elements.phareCorrect.checked;
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (phareActif && !phareDepose)
                    errMes.innerHTML += "<li>Phare activé mais pas déposé</li>";
                if (phareCorrect && !phareActif)
                    errMes.innerHTML += "<li>Phare déployé mais pas activé</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : 2*phareDepose + 3*phareActif + 10*phareCorrect);
            }
        case "mouillage":
            return function(form) {
                const nbRobots = parseInt(form.elements.nbRobots.value);
                for (const elem of form.children) {
                    if (elem.dataset.siNbRobots == undefined) continue;
                    elem.style.display = (nbRobots == elem.dataset.siNbRobots ? "" : "none");
                }
                
                form.dataset.score = parseInt(nbRobots == 1 ? form.elements.pts1.value : form.elements.pts2.value);
            }
        case "pavillon":
            return function(form) {
                form.dataset.score = 10 * form.elements.pavillon.checked;
            }
    }
    return function(elem) { alert("error 1234"); };
}

function updateScore() {
    let scoreJaune = 0;
    let scoreBleue = 0;
    for (const form of document.querySelectorAll('form[name*="jaune"]'))
        scoreJaune += parseInt(form.dataset.score);
    for (const form of document.querySelectorAll('form[name*="bleue"]'))
        scoreBleue += parseInt(form.dataset.score);
    const scoreEstimeJaune = document.forms["score-estime-jaune"].elements.scoreEstime.value;
    const scoreEstimeBleue = document.forms["score-estime-bleue"].elements.scoreEstime.value;
    const bonusJaune = Math.ceil(Math.max(0, (0.3*scoreJaune) - Math.abs(scoreJaune - scoreEstimeJaune)));
    const bonusBleue = Math.ceil(Math.max(0, (0.3*scoreBleue) - Math.abs(scoreBleue - scoreEstimeBleue)));
    const totalJaune = scoreJaune + bonusJaune + 5;
    const totalBleue = scoreBleue + bonusBleue + 5;
    document.getElementById("score-jaune").innerHTML = `${totalJaune} (${scoreJaune} +${bonusJaune} +5)`;
    document.getElementById("score-bleue").innerHTML = `${totalBleue} (${scoreBleue} +${bonusBleue} +5)`;
}

window.addEventListener('DOMContentLoaded', ()=> {
    // add validators to vanilla <input>
    for (const form of document.querySelectorAll("form[data-validator]")) {
        const errorMessage = document.createElement("ul");
        errorMessage.className = "alert alert-danger";
        errorMessage.setAttribute("hidden", "");
        form.appendChild(errorMessage);
        form.validatorFunc = () => { getValidator(form.dataset.validator)(form); updateScore(); };
        for (const input of document.querySelectorAll("input"))
            input.addEventListener("input", form.validatorFunc);
    }

    // on ajoute le score
    for (const form of document.getElementsByTagName("form"))
        form.dataset.score = 0;

    // create the "nbr-input" custom input
    for (const elem of document.getElementsByClassName("nbr-input")) {
        elem.classList.add("row");
        elem.classList.add("form-inline");

        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.classList.add("width-input");
        input.value = "0";
        input.setAttribute("name", elem.dataset.name);
        input.id = elem.dataset.id;
        input.dataset.valid = "";
        elem.appendChild(input);
        if (input.form.validatorFunc)
            input.addEventListener('input',input.form.validatorFunc);

        const newButton = function(name, intTransform) {
            const btn = document.createElement("button");
            btn.className = "btn btn-primary";
            btn.innerHTML = name;
            btn.style.marginLeft = "10px";
            btn.addEventListener('click', (evnt) => {
                let val = intTransform(parseInt(input.value));
                if (val < 0) val = 0;
                if (val > elem.dataset.max) val = elem.dataset.max;
                input.value = ""+val;
                if (input.form.validatorFunc)
                    input.form.validatorFunc();
                evnt.preventDefault();
            });
            return btn;
        };

        elem.appendChild(newButton("<i class=\"fas fa-plus\"></i>", nb => nb + 1));
        elem.appendChild(newButton("<i class=\"fas fa-minus\"></i>", nb => (nb <= 1 ? 0 : nb - 1)));
        elem.appendChild(newButton("<i class=\"fas fa-trash-alt\"></i>", nb => 0));
    }
    
    // calling all validators (needed for "mouillage" to display the correct div)
    for (const form of document.querySelectorAll("form[data-validator]"))
        form.validatorFunc();
    
    // "prédiction de performance"
    for (const input of document.querySelectorAll('[name="scoreEstime"]'))
        input.addEventListener('input', (evnt) => { evnt.preventDefault(); updateScore(); });
});